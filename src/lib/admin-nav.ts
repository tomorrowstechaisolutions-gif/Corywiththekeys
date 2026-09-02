import { FULL_ACCESS_ROLES, type UserRole } from "@/lib/roles";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Stable identifiers for the console's sections.
 *
 * These are stored per person in `profiles.sections`, so they are data, not
 * labels — renaming a nav item is free, renaming a key is a migration.
 */
export const ADMIN_SECTIONS = [
  "dashboard",
  "leads",
  "pipeline",
  "inventory",
  "shop",
  "applications",
  "trade-ins",
  "appointments",
  "customers",
  "messages",
  "partner-lots",
  "analytics",
  "team",
  "settings",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export type AdminNavItem = {
  key: AdminSection;
  label: string;
  href: string;
  /** Roles allowed to open this section. Omitted means any active staff. */
  roles?: readonly UserRole[];
  /** A one-line explanation, shown beside the tick box on the team screen. */
  description: string;
};

/**
 * Admin console navigation, with the role gate alongside each entry so the
 * sidebar and the page guard can never drift apart.
 *
 * Hiding a link is presentation, not security — every page also calls
 * requireSection(), and RLS is the final word on the data itself.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "The landing screen after signing in.",
  },
  {
    key: "leads",
    label: "Leads",
    href: "/admin/leads",
    description: "People who asked about a car or filled in a form.",
  },
  {
    key: "pipeline",
    label: "Pipeline",
    href: "/admin/pipeline",
    description: "Deals in progress, stage by stage.",
  },
  {
    key: "inventory",
    label: "Inventory",
    href: "/admin/inventory",
    description: "Add and edit vehicles, photos and prices.",
  },
  {
    key: "shop",
    label: "Merch Store",
    href: "/admin/shop",
    description: "Products, pictures, prices and stock.",
  },
  {
    key: "applications",
    label: "Prequalifications",
    href: "/admin/applications",
    description: "Finance enquiries from the website.",
  },
  {
    key: "trade-ins",
    label: "Trade-Ins",
    href: "/admin/trade-ins",
    description: "Vehicles customers want to trade.",
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "/admin/appointments",
    description: "Test drives and visits.",
  },
  {
    key: "customers",
    label: "Customers",
    href: "/admin/customers",
    description: "Customer records and history.",
  },
  {
    key: "messages",
    label: "Messages",
    href: "/admin/messages",
    description: "Conversations with customers.",
  },
  {
    key: "partner-lots",
    label: "Partner Lots",
    href: "/admin/partner-lots",
    description: "The lots whose inventory we list.",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    roles: FULL_ACCESS_ROLES,
    description: "Traffic and performance figures.",
  },
  {
    key: "team",
    label: "Team",
    href: "/admin/team",
    roles: FULL_ACCESS_ROLES,
    description: "Invite staff and set what they can reach.",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    roles: FULL_ACCESS_ROLES,
    description: "Business details and integrations.",
  },
];

export function navItem(key: AdminSection): AdminNavItem | undefined {
  return ADMIN_NAV.find((item) => item.key === key);
}

/** Sections a role may reach before any per-person restriction. */
export function sectionsForRole(role: UserRole): readonly AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.roles || item.roles.includes(role));
}

/**
 * What this person actually sees.
 *
 * The role gate applies first and always: a per-person tick box can never hand
 * someone a section their role does not allow.
 */
export function navFor(
  profile: Pick<Profile, "role" | "sections">,
): readonly AdminNavItem[] {
  const allowed = sectionsForRole(profile.role);
  if (profile.sections === null) return allowed;
  const granted = new Set(profile.sections);
  return allowed.filter((item) => granted.has(item.key));
}
