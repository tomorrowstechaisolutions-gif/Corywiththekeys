"use client";

import Link from "next/link";

import { track } from "@/lib/analytics";

/** Internal link out of the process cards, with its own tracked event. */
export function InventoryLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      onClick={() => track("finance_inventory_click", { placement: "step-01" })}
      className="inline-flex min-h-12 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold-500 transition hover:gap-3 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {label} <span aria-hidden>→</span>
    </Link>
  );
}
