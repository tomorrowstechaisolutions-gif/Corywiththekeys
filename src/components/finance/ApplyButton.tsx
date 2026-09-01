"use client";

import { EXTERNAL_LINK_PROPS, FINANCE_APPLICATION_URL } from "@/data/finance";
import { track } from "@/lib/analytics";

/**
 * The one component that links to the secure credit application.
 *
 * Every application CTA on the page renders this, so the URL is imported from
 * a single constant and can never drift between buttons. It also means the
 * click event is recorded in exactly one place.
 *
 * The event is `finance_application_click` — the customer OPENED the
 * application. It deliberately does not say "submitted" or "applied": we have
 * no integration with the provider, so we know only that a link was followed.
 * Anything more would be inventing a status the business would then act on.
 */
export function ApplyButton({
  children,
  placement,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  /** Which CTA on the page this is, so we can tell them apart. */
  placement: string;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm";

  const styles =
    variant === "primary"
      ? "bg-[linear-gradient(100deg,#D4A33D,#F0C45A_55%,#D4A33D)] text-black hover:brightness-110"
      : "border border-gold-500/50 text-gold-300 hover:border-gold-400 hover:bg-gold-500/10";

  return (
    <a
      href={FINANCE_APPLICATION_URL}
      {...EXTERNAL_LINK_PROPS}
      onClick={() => track("finance_application_click", { placement })}
      className={`${base} ${styles} ${className}`}
    >
      {children}
      <span aria-hidden>→</span>
      {/* Says out loud what the arrow only implies. */}
      <span className="sr-only">(opens the secure application in a new tab)</span>
    </a>
  );
}
