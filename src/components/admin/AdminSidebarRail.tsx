"use client";

import Image from "next/image";
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
  markUrl,
  roleLabel,
}: {
  groups: readonly AdminNavGroup[];
  siteName: string;
  /** Uploaded console mark, or null for type only. */
  markUrl: string | null;
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
        {/*
          Collapsed, the mark is the only thing identifying the console, so it
          stays and the type goes. With no mark uploaded there is nothing to
          show at that width, which is fine — the icons below carry it.
        */}
        {collapsed ? (
          markUrl ? (
            <Link href="/admin/dashboard" aria-label={`${siteName} — dashboard`}>
              <Image
                src={markUrl}
                alt=""
                width={64}
                height={64}
                unoptimized={markUrl.startsWith("http")}
                className="h-7 w-7 object-contain"
              />
            </Link>
          ) : null
        ) : (
          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-2.5 leading-tight"
          >
            {markUrl ? (
              <Image
                src={markUrl}
                alt=""
                width={64}
                height={64}
                unoptimized={markUrl.startsWith("http")}
                className="h-8 w-8 shrink-0 object-contain"
              />
            ) : null}
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">
                {siteName}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-gold-500">
                Admin Console
              </span>
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
