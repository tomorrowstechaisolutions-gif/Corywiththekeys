"use client";

import { useEffect, useState } from "react";

import { ApplyButton } from "@/components/finance/ApplyButton";
import { track } from "@/lib/analytics";

/**
 * Sticky application CTA for phones.
 *
 * Appears once the hero's own button has scrolled away, so there are never
 * two identical calls to action on screen at once, and it never covers the
 * hero on first paint. Hidden entirely on desktop, where the page is short
 * enough that a CTA is always in reach.
 */
export function MobileFinanceCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 520);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/35 bg-finance-bg/95 p-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      // Kept out of the tab order while off-screen, so it is not a focus trap.
      aria-hidden={!visible}
      {...(visible ? {} : { inert: "" as unknown as boolean })}
    >
      <ApplyButton placement="mobile-sticky" className="w-full">
        Start Secure Application
      </ApplyButton>
    </div>
  );
}

/** Fires once per page view. Kept here so the page can stay a server component. */
export function FinancePageView() {
  useEffect(() => {
    track("finance_page_view");
  }, []);
  return null;
}
