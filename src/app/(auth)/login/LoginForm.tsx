"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, type SignInState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-keyblue-600 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-keyblue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-keyblue-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

const FIELD =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-keyblue-500 focus:bg-white focus:ring-2 focus:ring-keyblue-500/25";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wider text-navy-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className={FIELD}
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-wider text-navy-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className={FIELD}
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-xs text-red-700">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}
