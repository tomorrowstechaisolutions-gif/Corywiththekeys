"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import type { ReplyState } from "../actions";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save reply"}
    </button>
  );
}

/**
 * Replies are recorded, not delivered — no email or SMS provider is wired up
 * yet. The copy says so, because a box that looks like it sends and does not
 * is how a customer gets ignored for a week.
 */
export function ReplyForm({
  action,
  contactHint,
}: {
  action: (state: ReplyState, formData: FormData) => Promise<ReplyState>;
  contactHint: string | null;
}) {
  const [state, formAction] = useActionState<ReplyState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once it has been saved, so the next reply starts empty.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <h2 className="text-sm font-bold text-navy-900">Add a reply</h2>
      <p className="mt-1 text-xs text-navy-700">
        Saved to this conversation as a record of what was said. It is
        <strong className="font-semibold"> not sent to the customer</strong> —
        {contactHint ? ` reach them on ${contactHint}.` : " call or text them."}
      </p>

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
          Reply saved to the conversation.
        </p>
      ) : null}

      <div className="mt-3">
        <label htmlFor="body" className="sr-only">
          Your reply
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          placeholder="What did you tell them?"
          aria-invalid={Boolean(state.fieldErrors?.body)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
        />
        {state.fieldErrors?.body ? (
          <p role="alert" className="mt-1 text-xs text-red-700">
            {state.fieldErrors.body}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <SaveButton />
      </div>
    </form>
  );
}
