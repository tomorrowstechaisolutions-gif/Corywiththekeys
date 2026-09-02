"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { findMyCar, type LeadFormState } from "@/app/(site)/inventory/actions";
import { useSettings } from "@/components/providers/SettingsProvider";
import { VEHICLE_TYPE_OPTIONS } from "@/lib/validation/lead";

const FIELD =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-navy-700/40 focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

const LABEL = "text-[11px] font-semibold uppercase tracking-wider text-navy-700";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-keyblue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending…" : "Have Cory Find My Car"}
      {pending ? null : <span aria-hidden>→</span>}
    </button>
  );
}

export function FindMyCarForm() {
  const { contact } = useSettings();
  const [state, formAction] = useActionState<LeadFormState, FormData>(
    findMyCar,
    {},
  );
  const renderedAtRef = useRef<HTMLInputElement>(null);

  // Stamped on the client so the server can measure how long the form was
  // open. Filled in after mount so a cached page never ships a stale time.
  useEffect(() => {
    if (renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, []);

  const err = (field: string) => state.fieldErrors?.[field];

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
      >
        <p className="text-lg font-bold text-emerald-900">
          Got it — Cory will be in touch.
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          We&rsquo;ll reach out on the number you gave us. If you need someone
          sooner, call or text{" "}
          <a href={contact.phoneHref} className="font-semibold underline">
            {contact.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="fullName" className={LABEL}>
            Name
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Full name"
            aria-invalid={Boolean(err("fullName"))}
            className={FIELD}
          />
          {err("fullName") ? (
            <p className="mt-1 text-xs text-red-700">{err("fullName")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className={LABEL}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(254) 987-0063"
            aria-invalid={Boolean(err("phone"))}
            className={FIELD}
          />
          {err("phone") ? (
            <p className="mt-1 text-xs text-red-700">{err("phone")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(err("email"))}
            className={FIELD}
          />
          {err("email") ? (
            <p className="mt-1 text-xs text-red-700">{err("email")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="vehicleType" className={LABEL}>
            Vehicle Type
          </label>
          <select id="vehicleType" name="vehicleType" className={FIELD}>
            {VEHICLE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="makeModel" className={LABEL}>
            Make / Model
          </label>
          <input
            id="makeModel"
            name="makeModel"
            placeholder="e.g. Dodge Charger"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="budget" className={LABEL}>
            Budget / Monthly Payment
          </label>
          <input
            id="budget"
            name="budget"
            placeholder="e.g. $500/mo"
            className={FIELD}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-navy-700/70">
          We&rsquo;ll only use this to help you find a vehicle.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
