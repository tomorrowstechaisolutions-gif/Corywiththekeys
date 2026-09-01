import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const CONTROL =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-navy-700"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-navy-700/70">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROL, className)} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(CONTROL, className)}>
      {children}
    </select>
  );
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROL, "min-h-24", className)} />;
}

export function Fieldset({
  legend,
  description,
  children,
  columns = 3,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-sm font-bold text-navy-900">{legend}</legend>
      {description ? (
        <p className="mb-4 text-xs text-navy-700">{description}</p>
      ) : null}
      <div
        className={cn(
          "grid gap-4",
          columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {children}
      </div>
    </fieldset>
  );
}

export function Checkbox({
  label,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500"
      />
      <span>
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        {description ? (
          <span className="block text-xs text-navy-700">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
