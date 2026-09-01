"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ContactForm } from "@/components/contact/ContactForm";
import { TOPICS } from "@/data/contact";

const ICONS: Record<string, React.ReactNode> = {
  car: (
    <>
      <path d="M4 14.5 5.6 9.6A2 2 0 0 1 7.5 8.2h9a2 2 0 0 1 1.9 1.4L20 14.5" />
      <path d="M3.5 14.5h17v3.2a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.8H7.1v.8a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1z" />
      <path d="M6.8 16.2h.01M17.2 16.2h.01" strokeLinecap="round" />
    </>
  ),
  merch: (
    <>
      <path d="M8.5 4.5 6 5.8 4 8.6l2.2 1.7 1-1.1v9.3h9.6V9.2l1 1.1L20 8.6l-2-2.8-2.5-1.3" />
      <path d="M8.5 4.5a3.5 3.5 0 0 0 7 0" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6.6l10-2v10.6" />
      <circle cx="6.6" cy="18" r="2.4" />
      <circle cx="16.6" cy="15.2" r="2.4" />
    </>
  ),
  partnerships: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.8" cy="9.6" r="2" />
      <circle cx="18.2" cy="9.6" r="2" />
      <path d="M7.6 17.2a4.6 4.6 0 0 1 8.8 0" />
      <path d="M2.6 16.4a3.6 3.6 0 0 1 4.2-2.5M21.4 16.4a3.6 3.6 0 0 0-4.2-2.5" />
    </>
  ),
  general: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.6a2.3 2.3 0 1 1 3 2.2v1.4" strokeLinecap="round" />
      <path d="M12.8 16.4h.01" strokeLinecap="round" />
    </>
  ),
};

/**
 * The two-column middle of the page: topic shortcuts on the left, the form on
 * the right.
 *
 * They share state deliberately. Picking a topic on the left fills in the
 * select on the right and moves focus to the message box, so the shortcut
 * saves a step rather than just scrolling. Where a topic has a page that
 * serves it better — inventory, shop, music — the card offers that link too,
 * because a person who wants to browse cars should not have to write a note
 * and wait a day for a reply.
 */
export function ContactPanel() {
  const [topic, setTopic] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);

  function choose(next: string) {
    setTopic(next);
    // Put them where they can start typing, without yanking the whole page.
    const field = messageRef.current?.querySelector<HTMLTextAreaElement>(
      "textarea[name='message']",
    );
    field?.focus({ preventScroll: false });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-5">
      <section
        aria-labelledby="help-with"
        className="rounded-xl border border-white/10 bg-navy-900/50 p-4 sm:p-5"
      >
        <h2 id="help-with" className="text-sm font-extrabold uppercase tracking-wide text-white">
          What Can We <span className="text-keyblue-400">Help With?</span>
        </h2>

        <ul className="mt-4 space-y-2">
          {TOPICS.map((item) => {
            const active = topic === item.topic;

            return (
              <li key={item.key}>
                <div
                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                    active
                      ? "border-keyblue-500 bg-keyblue-600/15"
                      : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
                      active ? "bg-keyblue-600 text-white" : "bg-white/5 text-keyblue-400"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      {ICONS[item.key]}
                    </svg>
                  </span>

                  <button
                    type="button"
                    onClick={() => choose(item.topic)}
                    aria-pressed={active}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block text-sm font-bold text-white">
                      {item.title}
                    </span>
                    <span className="block text-xs leading-snug text-white/55">
                      {item.body}
                    </span>
                    <span className="sr-only">
                      — write to us about this
                    </span>
                  </button>

                  {item.href ? (
                    <Link
                      href={item.href}
                      className="shrink-0 rounded p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                    >
                      <span aria-hidden>›</span>
                      <span className="sr-only">Go to {item.title}</span>
                    </Link>
                  ) : (
                    <span aria-hidden className="shrink-0 px-1.5 text-white/25">
                      ›
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        ref={messageRef}
        aria-labelledby="send-message"
        className="rounded-xl border border-white/10 bg-navy-900/50 p-4 sm:p-6"
      >
        <h2
          id="send-message"
          className="text-sm font-extrabold uppercase tracking-wide text-white"
        >
          Send Us A <span className="text-keyblue-400">Message</span>
        </h2>

        <div className="mt-4">
          <ContactForm topic={topic} onTopicChange={setTopic} />
        </div>
      </section>
    </div>
  );
}
