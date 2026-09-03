"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { resendInvite, type TeamState } from "./actions";

function Button() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send the invite again"}
    </button>
  );
}

/**
 * Resend, with the outcome shown right here.
 *
 * The whole point of the button is reassurance that an email left the
 * building, so a silent success would defeat it.
 */
export function ResendInvite({ email }: { email: string }) {
  const [state, formAction] = useActionState<TeamState, FormData>(
    resendInvite,
    {},
  );

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="email" value={email} />

      <Button />

      {state.ok ? (
        <p role="status" className="mt-2 text-sm font-medium text-emerald-800">
          {state.message}
        </p>
      ) : null}

      {state.error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
