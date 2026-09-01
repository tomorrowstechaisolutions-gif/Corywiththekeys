import type { UserRole } from "@/lib/auth";

export type AdminNavItem = {
  label: string;
  href: string;
  /** Roles allowed to open this section. Omitted means any active staff. */
  roles?: readonly UserRole[];
};

/**
 * Admin console navigation, with the role gate alongside each entry so the
 * sidebar and the page guard can never drift apart.
 *
 * Hiding a link is presentation, not security — every page also calls
 * requireStaff() or requireRole(), and RLS is the final word.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Pipeline", href: "/admin/pipeline" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Prequalifications", href: "/admin/applications" },
  { label: "Trade-Ins", href: "/admin/trade-ins" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Partner Lots", href: "/admin/partner-lots" },
  { label: "Analytics", href: "/admin/analytics", roles: ["admin"] },
  { label: "Settings", href: "/admin/settings", roles: ["admin"] },
];

export function navFor(role: UserRole): readonly AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.roles || item.roles.includes(role));
}
