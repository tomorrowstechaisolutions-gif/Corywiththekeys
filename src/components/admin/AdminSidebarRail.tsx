"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import type { AdminNavGroup } from "@/lib/admin-nav";
import {
  getServerSidebarCollapsed,
  getSidebarCollapsed,
  subscribeSidebar,
  toggleSidebar,
} from "@/lib/sidebar-state";

/**
 * The fixed navigation rail, with its collapsed/expanded state.
 *
 * The choice is remembered per browser and read through an external store, so
 * there is no setState inside an effect and no hydration mismatch: the server
 * renders the rail expanded, and the first client read narrows it if that is
 * what the person chose.
 */
export function AdminSidebarRail({
  groups,
  siteName,
  roleLabel,
}: {
  groups: readonly AdminNavGroup[];
  siteName: string;
  roleLabel: string;
}) {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarCollapsed,
    getServerSidebarCollapsed,
  );

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-white/10 bg-navy-950 text-white transition-[width] duration-200 md:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-4 ${
          collapsed ? "justify-center" : "justify-between pl-5"
        }`}
      >
        {collapsed ? null : (
          <Link href="/admin/dashboard" className="block min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold">{siteName}</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-gold-500">
              Admin Console
            </span>
          </Link>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M4 5h16M4 12h16M4 19h16" />
          </svg>
        </button>
      </div>

      <nav
        aria-label="Admin"
        className={`min-h-0 flex-1 overflow-y-auto pb-6 ${
          collapsed ? "px-2" : "px-2"
        }`}
      >
        <AdminNavLinks groups={groups} collapsed={collapsed} />
      </nav>

      {collapsed ? null : (
        <div className="border-t border-white/10 px-5 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Signed in as {roleLabel}
          </p>
        </div>
      )}
    </aside>
  );
}
