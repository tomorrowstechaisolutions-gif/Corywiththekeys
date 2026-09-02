"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  sendContactMessage,
  type ContactFormState,
} from "@/app/(site)/contact/actions";
import { useSettings } from "@/components/providers/SettingsProvider";
import { TOPICS } from "@/data/contact";
import { CONTACT_TOPICS } from "@/lib/validation/contact";

const FIELD =
  "w-full rounded-md border border-white/12 bg-navy-950/55 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

function ErrorText({ children, id }: { children: string; id: string }) {
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
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-keyblue-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send Message"}
      {pending ? null : <span aria-hidden>→</span>}
    </button>
  );
}

/**
 * The message form.
 *
 * The topic can be preset by the cards beside it, so it is controlled state
 * rather than a plain select — clicking "Merch & Orders" should land the
 * visitor here with that already chosen.
 */
export function ContactForm({
  topic,
  onTopicChange,
}: {
  topic: string;
  onTopicChange: (value: string) => void;
}) {
  const { contact } = useSettings();
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    sendContactMessage,
    {},
  );
  const renderedAtRef = useRef<HTMLInputElement>(null);

  // Stamped on the client so the server can measure how long the form was
  // open. Written after mount so a cached page never ships a stale time.
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
        className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center"
      >
        <p className="text-lg font-bold text-emerald-200">
          Message sent — we&rsquo;ll be in touch.
        </p>
        <p className="mt-2 text-sm text-emerald-100/80">
          We typically reply within one business day. If you need someone
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
    <form action={formAction} noValidate className="space-y-3.5">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="sr-only">
            Your name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your Name"
            aria-invalid={Boolean(err("fullName"))}
            aria-describedby={err("fullName") ? "err-fullName" : undefined}
            className={FIELD}
          />
          {err("fullName") ? (
            <ErrorText id="err-fullName">{err("fullName")!}</ErrorText>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            aria-invalid={Boolean(err("email"))}
            aria-describedby={err("email") ? "err-email" : undefined}
            className={FIELD}
          />
          {err("email") ? <ErrorText id="err-email">{err("email")!}</ErrorText> : null}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="sr-only">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone Number"
          aria-invalid={Boolean(err("phone"))}
          aria-describedby={err("phone") ? "err-phone" : undefined}
          className={FIELD}
        />
        {err("phone") ? <ErrorText id="err-phone">{err("phone")!}</ErrorText> : null}
      </div>

      <div>
        <label htmlFor="topic" className="sr-only">
          What are you contacting us about?
        </label>
        <select
          id="topic"
          name="topic"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className={`${FIELD} appearance-none bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 [background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%239aa4af%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27m5%209%207%207%207-7%27%2F%3E%3C%2Fsvg%3E")]`}
        >
          <option value="">What are you contacting us about?</option>
          {CONTACT_TOPICS.map((option) => (
            <option key={option} value={option} className="bg-navy-950">
              {option}
            </option>
          ))}
        </select>
        {err("topic") ? <ErrorText id="err-topic">{err("topic")!}</ErrorText> : null}
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Your Message"
          aria-invalid={Boolean(err("message"))}
          aria-describedby={err("message") ? "err-message" : undefined}
          className={`${FIELD} resize-y`}
        />
        {err("message") ? (
          <ErrorText id="err-message">{err("message")!}</ErrorText>
        ) : null}
      </div>

      <SubmitButton />

      <p className="flex items-center justify-center gap-2 text-xs text-white/50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 text-keyblue-400"
          aria-hidden
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 1.8" strokeLinecap="round" />
        </svg>
        We typically respond within one business day.
      </p>
    </form>
  );
}

/** Kept beside the form so both read the same list. */
export const TOPIC_KEYS = TOPICS.map((t) => t.topic);
