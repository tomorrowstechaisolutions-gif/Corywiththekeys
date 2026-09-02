"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { IntakeState } from "../actions";

function Button({ blocked }: { blocked: string[] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || blocked.length > 0}
      className="w-full rounded-md bg-emerald-600 px-5 py-4 text-base font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send for review"}
    </button>
  );
}

/**
 * The last step.
 *
 * The button is disabled while anything is missing AND the reason is spelled
 * out underneath — a greyed-out button with no explanation is the single
 * fastest way to make working software look broken.
 */
export function SubmitIntake({
  action,
  blocked,
}: {
  action: (state: IntakeState, formData: FormData) => Promise<IntakeState>;
  blocked: string[];
}) {
  const [state, formAction] = useActionState<IntakeState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <Button blocked={blocked} />

      {blocked.length > 0 ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          Still needed before you can send this in:{" "}
          {blocked.join(", ").replace(/, ([^,]*)$/, " and $1")}.
        </p>
      ) : (
        <p className="text-center text-xs text-navy-700/70">
          Nothing goes live until Cory or an admin approves it.
        </p>
      )}
    </form>
  );
}
