"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  submitFinanceLead,
  type FinanceLeadState,
} from "@/app/(site)/finance/actions";
import { ApplyButton } from "@/components/finance/ApplyButton";
import { Container } from "@/components/ui/Container";
import { track } from "@/lib/analytics";
import { CONTACT } from "@/lib/constants";
import {
  CONTACT_METHODS,
  DOWN_PAYMENT_OPTIONS,
  TRADE_IN_OPTIONS,
} from "@/lib/validation/finance";

const FIELD =
  "min-h-12 w-full rounded-md border border-gold-500/30 bg-black/50 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25";

const LABEL =
  "block text-[10px] font-bold uppercase tracking-wider text-finance-muted";

const SELECT_ARROW =
  'appearance-none bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 [background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23D4A33D%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27m5%209%207%207%207-7%27%2F%3E%3C%2Fsvg%3E")]';

function Err({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-400">
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
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-gold-500/50 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-300 transition hover:border-gold-400 hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending…" : "Send This To Cory"}
    </button>
  );
}

/**
 * Optional pre-application lead capture.
 *
 * NOT the credit application, and it says so twice — once above the fields
 * and once beside the submit. It collects what someone is shopping for so
 * Cory can prepare; the sensitive application stays with the provider.
 *
 * Filling it in is never required: the secure application button sits right
 * beside it, before, during and after. If the save fails, the message says so
 * and still points at the application rather than trapping anyone.
 */
export function FinanceLeadForm() {
  const [state, formAction] = useActionState<FinanceLeadState, FormData>(
    submitFinanceLead,
    {},
  );
  const renderedAtRef = useRef<HTMLInputElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, []);

  useEffect(() => {
    if (state.ok) track("finance_lead_submitted", { placement: "finance-form" });
  }, [state.ok]);

  function onFirstInput() {
    if (started) return;
    setStarted(true);
    track("finance_lead_started", { placement: "finance-form" });
  }

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <section id="what-are-you-looking-for" className="scroll-mt-24 bg-finance-bg pb-14">
      <Container>
        <div className="rounded-lg border border-gold-500/30 bg-finance-panel p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold-500">
            Optional — before you apply
          </p>
          <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
            What Are You Looking For?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-finance-muted">
            This is not the credit application. Tell Cory what you have in mind
            and he can have options ready before you get there — or skip it
            entirely and go straight to the secure application.
          </p>

          {state.ok ? (
            <div
              role="status"
              className="mt-6 rounded-lg border border-gold-500/40 bg-gold-500/10 p-6"
            >
              <p className="text-lg font-bold text-white">
                Got it — Cory has your details.
              </p>
              <p className="mt-2 max-w-xl text-sm text-finance-muted">
                Next step is the secure credit application. It only takes a few
                minutes, and it opens in a new tab so this page stays put.
              </p>
              <div className="mt-5">
                <ApplyButton placement="lead-form-success">
                  Continue To Secure Application
                </ApplyButton>
              </div>
            </div>
          ) : (
            <form
              action={formAction}
              noValidate
              onInput={onFirstInput}
              className="mt-6"
            >
              {/* Honeypot. Hidden from people, irresistible to bots. */}
              <div
                aria-hidden
                className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
              >
                <label htmlFor="fin-company">Company</label>
                <input id="fin-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

              {state.message ? (
                <p
                  role="alert"
                  className="mb-5 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
                >
                  {state.message}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={LABEL}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    aria-invalid={Boolean(err("firstName"))}
                    aria-describedby={err("firstName") ? "e-firstName" : undefined}
                    className={`${FIELD} mt-1.5`}
                  />
                  {err("firstName") ? <Err id="e-firstName">{err("firstName")!}</Err> : null}
                </div>

                <div>
                  <label htmlFor="lastName" className={LABEL}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    className={`${FIELD} mt-1.5`}
                  />
                </div>

                <div>
                  <label htmlFor="fin-phone" className={LABEL}>
                    Phone
                  </label>
                  <input
                    id="fin-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={Boolean(err("phone"))}
                    aria-describedby={err("phone") ? "e-phone" : undefined}
                    className={`${FIELD} mt-1.5`}
                  />
                  {err("phone") ? <Err id="e-phone">{err("phone")!}</Err> : null}
                </div>

                <div>
                  <label htmlFor="fin-email" className={LABEL}>
                    Email
                  </label>
                  <input
                    id="fin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(err("email"))}
                    aria-describedby={err("email") ? "e-email" : undefined}
                    className={`${FIELD} mt-1.5`}
                  />
                  {err("email") ? <Err id="e-email">{err("email")!}</Err> : null}
                </div>

                <div>
                  <label htmlFor="vehicle" className={LABEL}>
                    Vehicle interested in
                  </label>
                  <input
                    id="vehicle"
                    name="vehicle"
                    placeholder="Make, model, or “not sure yet”"
                    className={`${FIELD} mt-1.5`}
                  />
                </div>

                <div>
                  <label htmlFor="downPaymentBand" className={LABEL}>
                    Approximate down payment
                  </label>
                  <select
                    id="downPaymentBand"
                    name="downPaymentBand"
                    defaultValue=""
                    className={`${FIELD} ${SELECT_ARROW} mt-1.5`}
                  >
                    <option value="">Select a range</option>
                    {DOWN_PAYMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-finance-panel">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-white/40">
                    A range is all we need — never an exact figure.
                  </p>
                </div>

                <div>
                  <label htmlFor="tradeIn" className={LABEL}>
                    Trade-in?
                  </label>
                  <select
                    id="tradeIn"
                    name="tradeIn"
                    defaultValue=""
                    className={`${FIELD} ${SELECT_ARROW} mt-1.5`}
                  >
                    <option value="">Select</option>
                    {TRADE_IN_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-finance-panel">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contactMethod" className={LABEL}>
                    Preferred contact method
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    defaultValue=""
                    className={`${FIELD} ${SELECT_ARROW} mt-1.5`}
                  >
                    <option value="">Select</option>
                    {CONTACT_METHODS.map((option) => (
                      <option key={option} value={option} className="bg-finance-panel">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="lookingFor" className={LABEL}>
                  What are you looking for?
                </label>
                <textarea
                  id="lookingFor"
                  name="lookingFor"
                  rows={4}
                  placeholder="Anything that helps — body style, budget per month, timing, must-haves."
                  className={`${FIELD} mt-1.5 resize-y`}
                />
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <SubmitButton />
                <span className="text-xs text-white/40 sm:px-2">or</span>
                <ApplyButton placement="lead-form-skip">
                  Skip &amp; Start Secure Application
                </ApplyButton>
              </div>

              <p className="mt-5 max-w-2xl text-[11px] leading-relaxed text-white/40">
                We never ask for a Social Security number, driver&rsquo;s licence,
                date of birth or bank details on this site. Those are only ever
                entered on The Key Konnect&rsquo;s secure financing application.
                Questions? Call {CONTACT.phone}.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
