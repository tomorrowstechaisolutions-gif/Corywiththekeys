"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import type { SettingsState } from "./actions";

/**
 * One save button per card, so a change to the opening hours cannot be lost
 * by someone editing the address in another card and saving that instead.
 */
export function SaveButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function SettingsCard({
  title,
  description,
  state,
  action,
  children,
  saveLabel,
  footnote,
}: {
  title: string;
  description: string;
  state: SettingsState;
  action: (formData: FormData) => void;
  children: ReactNode;
  saveLabel?: string;
  footnote?: ReactNode;
}) {
  return (
    <form
      action={action}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-navy-700">{description}</p>

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

      <div className="mt-5">{children}</div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {footnote ? (
          <p className="max-w-md text-xs leading-relaxed text-navy-700/70">
            {footnote}
          </p>
        ) : (
          <span />
        )}
        <SaveButton label={saveLabel} />
      </div>
    </form>
  );
}

/** A labelled switch. Used for every on/off setting on this screen. */
export function Toggle({
  name,
  label,
  hint,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  hint: ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500"
      />
      <span>
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        <span className="block text-xs leading-relaxed text-navy-700">
          {hint}
        </span>
      </span>
    </label>
  );
}
