"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The Quick Action menu.
 *
 * Every entry goes to a route that exists. The four at the top do the thing
 * today; the rest are marked, because a menu item that quietly lands on a
 * stand-in screen is worse than one that says so first.
 */
const READY = [
  { label: "Add a vehicle", href: "/admin/inventory/new" },
  { label: "Add a lead", href: "/admin/leads/new" },
  { label: "Phone intake (scan a VIN)", href: "/admin/intake" },
  { label: "Add a product", href: "/admin/shop/new" },
] as const;

const PLANNED = [
  { label: "Schedule an appointment", href: "/admin/appointments" },
  { label: "Create a social post", href: "/admin/content" },
  { label: "Create a campaign", href: "/admin/campaigns" },
  { label: "Open AI Command Center", href: "/admin/ai" },
] as const;

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);
  const wrapper = useRef<HTMLDivElement>(null);

  if (open && openedOn !== pathname) {
    setOpen(false);
    setOpenedOn(pathname);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-keyblue-700"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Quick action
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg sm:left-auto sm:right-0"
        >
          {READY.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-navy-900 transition hover:bg-slate-50"
            >
              {action.label}
            </Link>
          ))}

          <p className="mt-1 border-t border-slate-100 px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Not built yet
          </p>

          {PLANNED.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
            >
              {action.label}
              <span className="rounded bg-slate-100 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                Soon
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
