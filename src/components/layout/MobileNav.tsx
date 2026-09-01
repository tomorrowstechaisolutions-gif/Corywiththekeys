"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CONTACT, SITE_NAV } from "@/lib/constants";

/** Slide-down navigation for screens too narrow for the full menu. */
export function MobileNav() {
  const pathname = usePathname();

  // The panel is open only for the route it was opened on. Deriving it this
  // way means navigating anywhere closes it — including via the back button —
  // without an effect that fights React's render cycle.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  // Stop the page scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white transition hover:bg-white/10"
      >
        <span aria-hidden className="relative block h-3.5 w-4">
          <span
            className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
          />
          <span
            className={`absolute left-0 top-1.5 h-0.5 w-4 bg-current transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
          />
        </span>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-navy-950 pb-8 shadow-2xl"
        >
          <nav aria-label="Mobile">
            <ul className="divide-y divide-white/5">
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-5 py-3.5 text-base font-medium text-white/90 transition hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-5 space-y-3 px-5">
            <a
              href={CONTACT.phoneHref}
              className="flex items-center justify-center rounded-md border border-white/25 px-4 py-3 text-base font-bold text-white"
            >
              Call or text {CONTACT.phone}
            </a>
            <Link
              href="/apply"
              className="flex items-center justify-center rounded-md bg-keyblue-600 px-4 py-3 text-base font-bold text-white"
            >
              Get Approved
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
