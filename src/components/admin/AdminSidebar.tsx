import { AdminSidebarRail } from "@/components/admin/AdminSidebarRail";

import { groupNav, navFor } from "@/lib/admin-nav";
import { ROLE_LABELS, type Profile } from "@/lib/auth";
import { SITE } from "@/lib/constants";

/**
 * Admin console navigation rail, filtered to what this role may open.
 *
 * Shown from `md` rather than `lg`: a Windows laptop at 150% display scaling
 * reports well under 1024 CSS pixels, which used to leave the console with no
 * navigation on a screen that is physically wide. Below `md`, AdminMobileNav
 * in the topbar takes over.
 *
 * This stays a server component so `lib/auth` — and through it the server-only
 * Supabase client — never reaches the browser bundle. The rail's collapse
 * state lives in AdminSidebarRail, which takes plain data as props.
 */
export function AdminSidebar({ profile }: { profile: Profile }) {
  return (
    <AdminSidebarRail
      groups={groupNav(navFor(profile))}
      siteName={SITE.name}
      roleLabel={ROLE_LABELS[profile.role]}
    />
  );
}
