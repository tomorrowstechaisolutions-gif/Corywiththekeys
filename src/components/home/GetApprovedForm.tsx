"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  submitPrequalification,
  type PrequalFormState,
} from "@/app/(site)/apply/actions";
import { CONTACT } from "@/lib/constants";
import {
  CONSENT_TEXT,
  DOWN_PAYMENT_OPTIONS,
  EMPLOYMENT_OPTIONS,
  INCOME_OPTIONS,
  VEHICLE_PREFERENCE_OPTIONS,
} from "@/lib/validation/prequalification";

const FIELD =
  "w-full rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-keyblue-400 focus:bg-white/15 focus:ring-2 focus:ring-keyblue-400/30";

const SELECT = `${FIELD} appearance-none [&>option]:bg-navy-900 [&>option]:text-white`;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Get Started"}
      {pending ? null : <span aria-hidden>→</span>}
    </button>
  );
}

/**
 * The dark "Get Approved Fast" panel from the approved design.
 *
 * Collects prequalification detail only — banded income and down payment,
 * never exact figures, and nothing a lender would need. Writes through a
 * Server Action; there is no anonymous database access.
 */
export function GetApprovedForm() {
  const [state, formAction] = useActionState<PrequalFormState, FormData>(
    submitPrequalification,
    {},
  );
  const renderedAtRef = useRef<HTMLInputElement>(null);

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
        className="flex h-full flex-col justify-center rounded-xl border-t-4 border-gold-500 bg-navy-900 p-8 text-center text-white"
      >
        <p className="text-2xl font-extrabold">You&rsquo;re in.</p>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          Cory has your details and will reach out shortly. Want to talk sooner?
        </p>
        <a
          href={CONTACT.phoneHref}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition hover:bg-gold-400"
        >
          Call or text {CONTACT.phone}
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-xl border-t-4 border-gold-500 bg-navy-900 p-6 text-white sm:p-7"
    >
      <h2 className="text-xl font-extrabold">Get Approved Fast</h2>
      <p className="mt-1 text-sm text-white/70">
        No impact to your credit score to get started.
      </p>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="ga-company">Company</label>
        <input id="ga-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

      {state.message ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-100"
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        <div>
          <label htmlFor="ga-name" className="sr-only">
            Full name
          </label>
          <input
            id="ga-name"
            name="fullName"
            autoComplete="name"
            placeholder="Full Name"
            aria-invalid={Boolean(err("fullName"))}
            className={FIELD}
          />
          {err("fullName") ? (
            <p className="mt-1 text-xs text-red-300">{err("fullName")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ga-phone" className="sr-only">
            Phone number
          </label>
          <input
            id="ga-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone Number"
            aria-invalid={Boolean(err("phone"))}
            className={FIELD}
          />
          {err("phone") ? (
            <p className="mt-1 text-xs text-red-300">{err("phone")}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ga-email" className="sr-only">
            Email address
          </label>
          <input
            id="ga-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            aria-invalid={Boolean(err("email"))}
            className={FIELD}
          />
          {err("email") ? (
            <p className="mt-1 text-xs text-red-300">{err("email")}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ga-employment" className="sr-only">
              Employment
            </label>
            <select id="ga-employment" name="employment" className={SELECT}>
              {EMPLOYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ga-income" className="sr-only">
              Monthly income
            </label>
            <select id="ga-income" name="monthlyIncomeBand" className={SELECT}>
              {INCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ga-down" className="sr-only">
            Down payment
          </label>
          <select id="ga-down" name="downPaymentBand" className={SELECT}>
            {DOWN_PAYMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ga-vehicle" className="sr-only">
            Preferred vehicle type
          </label>
          <select
            id="ga-vehicle"
            name="preferredVehicleType"
            className={SELECT}
          >
            {VEHICLE_PREFERENCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            name="consentContact"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/10 text-keyblue-600 focus:ring-keyblue-400"
          />
          <span className="text-[11px] leading-relaxed text-white/60">
            {CONSENT_TEXT}
          </span>
        </label>
        {err("consentContact") ? (
          <p className="text-xs text-red-300">{err("consentContact")}</p>
        ) : null}

        <SubmitButton />
      </div>
    </form>
  );
}
