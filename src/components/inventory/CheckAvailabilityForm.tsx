"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  submitVehicleInquiry,
  type InquiryState,
} from "@/app/(site)/inventory/[slug]/actions";
import { CONTACT } from "@/lib/constants";
import {
  CONTACT_METHODS,
  CONTACT_METHOD_LABELS,
} from "@/lib/validation/vehicle-inquiry";

const FIELD =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-navy-700/40 focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

const LABEL = "text-xs font-semibold uppercase tracking-wider text-navy-700";

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-700">
      {children}
    </p>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-keyblue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Check Availability"}
      {pending ? null : <span aria-hidden>→</span>}
    </button>
  );
}

/**
 * "Is it still here?" — the question a used-car shopper actually has.
 *
 * Kept to a name, one way to reach them and an optional note. Nothing about
 * credit, income or identity: the financing conversation lives behind the
 * secure application on /finance, and a listing page is the wrong place to ask
 * a stranger for anything sensitive.
 */
export function CheckAvailabilityForm({
  vehicleId,
  vehicleTitle,
}: {
  vehicleId: string;
  vehicleTitle: string;
}) {
  const [state, formAction] = useActionState<InquiryState, FormData>(
    submitVehicleInquiry,
    {},
  );
  const [method, setMethod] = useState<string>("text");
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
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
      >
        <p className="text-lg font-extrabold text-navy-900">Message sent.</p>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          Cory has your details and the car you asked about. Want an answer
          sooner?
        </p>
        <a
          href={CONTACT.phoneHref}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-keyblue-500"
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
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-extrabold text-navy-900">
        Still available?
      </h2>
      <p className="mt-1 text-sm text-navy-700">
        Ask about this {vehicleTitle} and Cory will get back to you.
      </p>

      {state.message ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          {state.message}
        </p>
      ) : null}

      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="ca-company">Company</label>
        <input id="ca-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="renderedAt" ref={renderedAtRef} defaultValue="" />
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="ca-name" className={LABEL}>
            Your name
          </label>
          <input
            id="ca-name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={err("name") ? "ca-name-error" : undefined}
            className={FIELD}
          />
          {err("name") ? (
            <ErrorText id="ca-name-error">{err("name")!}</ErrorText>
          ) : null}
        </div>

        <fieldset>
          <legend className={LABEL}>How should Cory reach you?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONTACT_METHODS.map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  method === value
                    ? "border-keyblue-600 bg-keyblue-600 text-white"
                    : "border-slate-300 bg-white text-navy-700 hover:border-keyblue-400"
                }`}
              >
                <input
                  type="radio"
                  name="contactMethod"
                  value={value}
                  checked={method === value}
                  onChange={() => setMethod(value)}
                  className="sr-only"
                />
                {CONTACT_METHOD_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ca-phone" className={LABEL}>
              Phone {method === "email" ? <span className="normal-case text-navy-700/60">(optional)</span> : null}
            </label>
            <input
              id="ca-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={err("phone") ? true : undefined}
              aria-describedby={err("phone") ? "ca-phone-error" : undefined}
              className={FIELD}
            />
            {err("phone") ? (
              <ErrorText id="ca-phone-error">{err("phone")!}</ErrorText>
            ) : null}
          </div>

          <div>
            <label htmlFor="ca-email" className={LABEL}>
              Email {method !== "email" ? <span className="normal-case text-navy-700/60">(optional)</span> : null}
            </label>
            <input
              id="ca-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={err("email") ? true : undefined}
              aria-describedby={err("email") ? "ca-email-error" : undefined}
              className={FIELD}
            />
            {err("email") ? (
              <ErrorText id="ca-email-error">{err("email")!}</ErrorText>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="ca-message" className={LABEL}>
            Anything you want to know? <span className="normal-case text-navy-700/60">(optional)</span>
          </label>
          <textarea
            id="ca-message"
            name="message"
            rows={3}
            placeholder="Is it still available? Can I see it Saturday?"
            className={`${FIELD} min-h-20`}
          />
        </div>

        <SubmitButton />

        <p className="text-xs leading-relaxed text-navy-700/70">
          Just a question about this car — no credit check and nothing sensitive
          asked. Ready to get approved?{" "}
          <Link href="/finance" className="font-semibold text-keyblue-600 underline">
            Start the secure application
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
