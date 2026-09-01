import Link from "next/link";

import { AdminNavLinks } from "@/components/admin/AdminNavLinks";

import { navFor } from "@/lib/admin-nav";
import { ROLE_LABELS, type Profile } from "@/lib/auth";
import { SITE } from "@/lib/constants";

/**
 * Admin console navigation rail, filtered to what this role may open.
 *
 * Shown from `md` rather than `lg`: a Windows laptop at 150% display scaling
 * reports well under 1024 CSS pixels, which used to leave the console with no
 * navigation on a screen that is physically wide. Below `md`, AdminMobileNav
 * in the topbar takes over.
 */
export function AdminSidebar({ profile }: { profile: Profile }) {
  const items = navFor(profile.role);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-navy-950 text-white md:block">
      <div className="px-5 py-5">
        <Link href="/admin/dashboard" className="block leading-tight">
          <span className="block text-sm font-bold">{SITE.name}</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
            Admin Console
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="px-2 pb-8">
        <AdminNavLinks items={items} />
      </nav>

      <div className="px-5 pb-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Signed in as {ROLE_LABELS[profile.role]}
        </p>
      </div>
    </aside>
  );
}
