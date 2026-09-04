"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import type { AdminNavGroup } from "@/lib/admin-nav";

/**
 * Admin navigation for narrow viewports.
 *
 * The sidebar rail is desktop-only, and until this existed there was nothing
 * below that breakpoint — the console had no navigation at all on a tablet,
 * on a phone, or on a Windows laptop at 150% display scaling, where a
 * physically wide window reports well under 1024 CSS pixels.
 */
export function AdminMobileNav({
  groups,
}: {
  groups: readonly AdminNavGroup[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close on navigation, without setting state inside an effect.
  if (open && openedOn !== pathname) {
    setOpen(false);
    setOpenedOn(pathname);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-slate-50"
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
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-navy-950/60"
          />

          <nav
            id="admin-mobile-nav"
            aria-label="Admin"
            className="absolute inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-navy-950 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Admin Console
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded p-1 text-muted transition hover:text-white"
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
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="px-2 pb-8">
              <AdminNavLinks
                groups={groups}
                size="roomy"
                onNavigate={() => setOpen(false)}
              />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
