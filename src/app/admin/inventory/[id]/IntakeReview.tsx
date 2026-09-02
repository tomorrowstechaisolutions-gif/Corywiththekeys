"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { IntakeState } from "@/app/admin/intake/actions";

function Pending({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? busy : label}</>;
}

/**
 * The review banner on a vehicle that came in from a phone.
 *
 * Two outcomes and nothing else: accept it, or send it back with a reason.
 * "Send back" opens a note box rather than firing straight away, because a
 * rejection with no explanation just produces the same submission again.
 */
export function IntakeReview({
  approve,
  returnAction,
  hasPrice,
  capturedBy,
  submittedAt,
}: {
  approve: () => Promise<void>;
  returnAction: (state: IntakeState, formData: FormData) => Promise<IntakeState>;
  hasPrice: boolean;
  capturedBy: string;
  submittedAt: string | null;
}) {
  const [returning, setReturning] = useState(false);
  const [state, formAction] = useActionState<IntakeState, FormData>(
    returnAction,
    {},
  );

  return (
    <section className="mt-5 overflow-hidden rounded-lg border-2 border-gold-600 bg-white">
      <div className="bg-gold-600 px-4 py-3">
        <h2 className="text-sm font-bold text-white">
          Captured on a phone — waiting on you
        </h2>
        <p className="mt-0.5 text-xs text-white/85">
          By {capturedBy}
          {submittedAt
            ? ` · sent ${new Date(submittedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}`
            : ""}
          . It is not on the public site.
        </p>
      </div>

      <div className="px-4 py-4">
        <p className="text-sm text-navy-800">
          Check the details and photos below, then accept it or send it back.
        </p>

        {!hasPrice ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            There is no price on this yet. You can still accept it — it will
            stay a draft until somebody prices it.
          </p>
        ) : null}

        {state.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {state.error}
          </p>
        ) : null}

        {state.ok ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            Sent back. It is now on their phone with your note.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <form action={approve}>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Pending
                label={hasPrice ? "Accept and publish" : "Accept as draft"}
                busy="Working…"
              />
            </button>
          </form>

          {!returning ? (
            <button
              type="button"
              onClick={() => setReturning(true)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-slate-50"
            >
              Send back
            </button>
          ) : null}
        </div>

        {returning ? (
          <form action={formAction} noValidate className="mt-4">
            <label
              htmlFor="note"
              className="text-xs font-semibold uppercase tracking-wider text-navy-700"
            >
              What needs fixing?
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="e.g. Need a photo of the odometer and the passenger side."
              aria-invalid={Boolean(state.fieldErrors?.note)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
            />
            {state.fieldErrors?.note ? (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {state.fieldErrors.note}
              </p>
            ) : null}

            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                <Pending label="Send it back" busy="Sending…" />
              </button>
              <button
                type="button"
                onClick={() => setReturning(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-navy-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
