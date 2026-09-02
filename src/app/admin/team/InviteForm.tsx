"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Field, Select, TextInput } from "@/components/ui/Field";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import { ROLE_DESCRIPTIONS, USER_ROLES } from "@/lib/validation/team";

import { inviteMember, type TeamState } from "./actions";

function InviteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send invite"}
    </button>
  );
}

/**
 * Invite by email.
 *
 * No password field, deliberately. Supabase emails them a link and they choose
 * their own — it never passes through this screen, this app, or Cory's hands.
 */
export function InviteForm({ canInvite }: { canInvite: boolean }) {
  const [state, formAction] = useActionState<TeamState, FormData>(
    inviteMember,
    {},
  );
  const [role, setRole] = useState<UserRole>("sales");

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold text-navy-900">Invite someone</h2>
      <p className="mt-1 text-sm text-navy-700">
        They get an email, pick their own password, and arrive switched off
        until you activate them.
      </p>

      {!canInvite ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Invites need the <code>SUPABASE_SERVICE_ROLE_KEY</code> environment
          variable, which is not set on this deployment. Add it in Vercel and
          this form will work.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="invite-email" error={err("email")}>
          <TextInput
            id="invite-email"
            name="email"
            type="email"
            autoComplete="off"
            required
          />
        </Field>

        <Field label="Name" htmlFor="invite-name" error={err("fullName")}>
          <TextInput id="invite-name" name="fullName" autoComplete="off" />
        </Field>

        <Field label="Job title" htmlFor="invite-title" error={err("title")}>
          <TextInput
            id="invite-title"
            name="title"
            placeholder="Sales, Lot Manager…"
            autoComplete="off"
          />
        </Field>

        <Field
          label="Role"
          htmlFor="invite-role"
          error={err("role")}
          hint={ROLE_DESCRIPTIONS[role]}
        >
          <Select
            id="invite-role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            {USER_ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <InviteButton />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-navy-700/70">
        You choose which sections they can open after they appear in the list
        below.
      </p>
    </form>
  );
}
