"use client";

import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  sendAssistantMessage,
  type AssistantFormState,
} from "@/app/(site)/assistant/actions";
import { useSettings } from "@/components/providers/SettingsProvider";

const FIELD =
  "w-full rounded-md border border-white/12 bg-navy-950/55 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

function ErrorText({ children, id }: { children: string; id: string }) {
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-400">
      {children}
    </p>
  );
}

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send"}
      {pending ? null : <span aria-hidden>→</span>}
    </button>
  );
}

/**
 * The floating "Ask us" panel, on every public page.
 *
 * It is a capture surface, not a chatbot: it takes the question and the way
 * to reply, and puts both in the admin inbox. Nothing is answered here, so
 * the copy promises a person rather than an instant answer.
 */
export function PageAssistant() {
  const { contact } = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AssistantFormState, FormData>(
    sendAssistantMessage,
    {},
  );

  const panelId = useId();
  const renderedAtRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Stamped after mount so a cached page never ships a stale open time.
  useEffect(() => {
    if (open && renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, [open]);

  // Focus the first field on open — a panel that appears without focus reads
  // as decorative, and keyboard users have nowhere to go.
  useEffect(() => {
    if (open && !state.ok) firstFieldRef.current?.focus();
  }, [open, state.ok]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label="Send us a message"
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/10 bg-navy-950 shadow-2xl shadow-black/40"
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-navy-900 px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-white">Ask us anything</p>
              <p className="mt-0.5 text-xs text-white/60">
                A real person replies — usually within one business day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden className="block text-lg leading-none">
                &times;
              </span>
            </button>
          </div>

          {state.ok ? (
            <div className="px-4 py-6 text-center">
              <p
                role="status"
                className="text-sm font-bold text-emerald-300"
              >
                Got it — we&rsquo;ll be in touch.
              </p>
              <p className="mt-2 text-xs text-white/70">
                Need someone sooner? Call or text{" "}
                <a href={contact.phoneHref} className="font-semibold underline">
                  {contact.phone}
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/60 transition hover:text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <form action={formAction} noValidate className="space-y-3 p-4">
              {/* Honeypot. Hidden from people, irresistible to bots. */}
              <div
                aria-hidden
                className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
              >
                <label htmlFor="assistant-company">Company</label>
                <input
                  id="assistant-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <input
                ref={renderedAtRef}
                type="hidden"
                name="renderedAt"
                defaultValue=""
              />
              <input type="hidden" name="path" value={pathname} />

              {state.message ? (
                <p
                  role="alert"
                  className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100"
                >
                  {state.message}
                </p>
              ) : null}

              <div>
                <label htmlFor="assistant-name" className="sr-only">
                  Your name
                </label>
                <input
                  ref={firstFieldRef}
                  id="assistant-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-invalid={Boolean(err("fullName"))}
                  aria-describedby={
                    err("fullName") ? "assistant-err-fullName" : undefined
                  }
                  className={FIELD}
                />
                {err("fullName") ? (
                  <ErrorText id="assistant-err-fullName">
                    {err("fullName")!}
                  </ErrorText>
                ) : null}
              </div>

              <div>
                <label htmlFor="assistant-phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="assistant-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone number"
                  aria-invalid={Boolean(err("phone"))}
                  aria-describedby={
                    err("phone") ? "assistant-err-phone" : undefined
                  }
                  className={FIELD}
                />
                {err("phone") ? (
                  <ErrorText id="assistant-err-phone">{err("phone")!}</ErrorText>
                ) : null}
              </div>

              <div>
                <label htmlFor="assistant-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="assistant-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email (or leave blank)"
                  aria-invalid={Boolean(err("email"))}
                  aria-describedby={
                    err("email") ? "assistant-err-email" : undefined
                  }
                  className={FIELD}
                />
                {err("email") ? (
                  <ErrorText id="assistant-err-email">{err("email")!}</ErrorText>
                ) : null}
              </div>

              <div>
                <label htmlFor="assistant-message" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="assistant-message"
                  name="message"
                  rows={3}
                  placeholder="What can we help with?"
                  aria-invalid={Boolean(err("message"))}
                  aria-describedby={
                    err("message") ? "assistant-err-message" : undefined
                  }
                  className={`${FIELD} resize-y`}
                />
                {err("message") ? (
                  <ErrorText id="assistant-err-message">
                    {err("message")!}
                  </ErrorText>
                ) : null}
              </div>

              <SendButton />

              <p className="text-center text-[0.7rem] leading-relaxed text-white/45">
                Or call{" "}
                <a href={contact.phoneHref} className="underline">
                  {contact.phone}
                </a>
              </p>
            </form>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="inline-flex items-center gap-2 rounded-full bg-keyblue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-keyblue-900/30 transition hover:bg-keyblue-500 focus:outline-none focus:ring-2 focus:ring-keyblue-400 focus:ring-offset-2 focus:ring-offset-navy-950"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5A8.3 8.3 0 0 1 4 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8 8.4Z" />
          )}
        </svg>
        {open ? "Close" : "Ask us"}
      </button>
    </div>
  );
}
