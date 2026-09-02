"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Field, Select, TextInput } from "@/components/ui/Field";
import { ADMIN_NAV, sectionsForRole, type AdminSection } from "@/lib/admin-nav";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import type { Database } from "@/types/database";
import { ROLE_DESCRIPTIONS, USER_ROLES } from "@/lib/validation/team";

import { updateMember, type TeamState } from "./actions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function MemberForm({
  member,
  isSelf,
  actorIsOwner,
}: {
  member: Profile;
  isSelf: boolean;
  /**
   * True for the owner, and also for an admin while no owner exists yet —
   * somebody has to be able to name the first one.
   */
  actorIsOwner: boolean;
}) {
  const [state, formAction] = useActionState<TeamState, FormData>(
    updateMember,
    {},
  );

  const [role, setRole] = useState<UserRole>(member.role);
  const [restrict, setRestrict] = useState(member.sections !== null);
  const [granted, setGranted] = useState<string[]>(member.sections ?? []);

  const err = (field: string) => state.fieldErrors?.[field];
  const availableKeys = new Set(sectionsForRole(role).map((item) => item.key));

  // An admin looking at the owner sees the role locked rather than an option
  // that fails on save. They can still fix the name, title and phone.
  const ownerSeatLocked = !actorIsOwner && (member.role === "owner" || role === "owner");

  const roleOptions = USER_ROLES.filter(
    (value) => value !== "owner" || actorIsOwner || member.role === "owner",
  );

  const toggle = (key: string) =>
    setGranted((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="id" value={member.id} />

      {/*
        A disabled control posts nothing, so without these the locked owner
        row would submit no role and an unticked Active box — and an admin
        fixing a typo in the owner's name would appear to demote them.
      */}
      {ownerSeatLocked ? (
        <>
          <input type="hidden" name="role" value={member.role} />
          {member.is_active ? (
            <input type="hidden" name="isActive" value="on" />
          ) : null}
        </>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${member.id}`} error={err("fullName")}>
          <TextInput
            id={`name-${member.id}`}
            name="fullName"
            defaultValue={member.full_name ?? ""}
          />
        </Field>

        <Field
          label="Job title"
          htmlFor={`title-${member.id}`}
          error={err("title")}
          hint="Shown in the console. Free text."
        >
          <TextInput
            id={`title-${member.id}`}
            name="title"
            placeholder="Sales, Lot Manager…"
            defaultValue={member.title ?? ""}
          />
        </Field>

        <Field label="Phone" htmlFor={`phone-${member.id}`} error={err("phone")}>
          <TextInput
            id={`phone-${member.id}`}
            name="phone"
            inputMode="tel"
            defaultValue={member.phone ?? ""}
          />
        </Field>

        <Field
          label="Role"
          htmlFor={`role-${member.id}`}
          error={err("role")}
          hint={ROLE_DESCRIPTIONS[role]}
        >
          <Select
            id={`role-${member.id}`}
            name="role"
            value={role}
            disabled={ownerSeatLocked}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            {roleOptions.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-navy-900">
          What they can open
        </legend>

        {role === "admin" || role === "owner" ? (
          <p className="text-sm text-navy-700">
            {role === "owner" ? "The owner" : "Admins"} reach every section.
            That is the point of the role — if you want to limit somebody, make
            them Sales or Viewer instead.
          </p>
        ) : (
          <>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                name="restrict"
                checked={restrict}
                onChange={(event) => setRestrict(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500"
              />
              <span>
                <span className="block text-sm font-medium text-navy-900">
                  Limit this person to certain sections
                </span>
                <span className="block text-xs text-navy-700">
                  Leave this off and they see everything their role allows.
                </span>
              </span>
            </label>

            {restrict ? (
              <>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {ADMIN_NAV.filter((item) => availableKeys.has(item.key)).map(
                    (item) => (
                      <li key={item.key}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 p-3 transition hover:border-keyblue-400">
                          <input
                            type="checkbox"
                            name="sections"
                            value={item.key}
                            checked={granted.includes(item.key)}
                            onChange={() => toggle(item.key)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-navy-900">
                              {item.label}
                            </span>
                            <span className="block text-xs leading-snug text-navy-700">
                              {item.description}
                            </span>
                          </span>
                        </label>
                      </li>
                    ),
                  )}
                </ul>

                {granted.filter((key) => availableKeys.has(key as AdminSection))
                  .length === 0 ? (
                  <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Nothing is ticked, so this person will be able to sign in
                    and reach nothing at all. Tick at least one section.
                  </p>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={member.is_active}
            disabled={ownerSeatLocked}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500 disabled:cursor-not-allowed"
          />
          <span>
            <span className="block text-sm font-medium text-navy-900">
              Active
            </span>
            <span className="block text-xs text-navy-700">
              Switch off to block access without deleting anything.
            </span>
          </span>
        </label>

        <SaveButton />
      </div>

      {ownerSeatLocked ? (
        <p className="text-xs text-navy-700/70">
          This is the owner&rsquo;s account. Only the owner can change that
          role or switch it off — you can still fix the details above.
        </p>
      ) : null}

      {isSelf ? (
        <p className="text-xs text-navy-700/70">
          This is you. You cannot remove your own admin role or deactivate
          yourself while you are the only active admin.
        </p>
      ) : null}
    </form>
  );
}
