"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Field, TextInput } from "@/components/ui/Field";
import type { Profile } from "@/lib/auth";

import { updateMyProfile, type ProfileState } from "./actions";

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

export function MyProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateMyProfile,
    {},
  );
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={action} noValidate className="space-y-5">
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
        <Field label="Name" htmlFor="fullName" error={err("fullName")}>
          <TextInput
            id="fullName"
            name="fullName"
            autoComplete="name"
            defaultValue={profile.full_name ?? ""}
          />
        </Field>

        <Field
          label="Job title"
          htmlFor="title"
          error={err("title")}
          hint="However you want to be described. Free text."
        >
          <TextInput
            id="title"
            name="title"
            placeholder="Sales, Lot Manager…"
            defaultValue={profile.title ?? ""}
          />
        </Field>

        <Field
          label="Phone"
          htmlFor="phone"
          error={err("phone")}
          hint="Your own line, for colleagues. Not shown on the website."
        >
          <TextInput
            id="phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={profile.phone ?? ""}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="email"
          hint="This is what you sign in with. Ask an admin to change it."
        >
          <TextInput id="email" value={profile.email} disabled readOnly />
        </Field>
      </div>

      <SaveButton />
    </form>
  );
}
