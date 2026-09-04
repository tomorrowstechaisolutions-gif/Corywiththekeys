import { FULL_ACCESS_ROLES, type UserRole } from "@/lib/roles";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Stable identifiers for the console's sections.
 *
 * These are stored per person in `profiles.sections`, so they are data, not
 * labels — renaming a nav item is free, renaming a key is a migration.
 *
 * Keys added when the console was regrouped into the Operations Command
 * Center are additive: `sections` of NULL means "no restriction", which is
 * what everyone currently has, so nobody's access changed. A person who HAS
 * an explicit list keeps exactly the sections on it and gets none of the new
 * ones until somebody ticks them — which is the safe direction.
 */
export const ADMIN_SECTIONS = [
  // Command
  "dashboard",
  "ai",
  "activity",
  // Sales
  "leads",
  "crm",
  "pipeline",
  "customers",
  "appointments",
  "messages",
  // Vehicles
  "inventory",
  "partner-lots",
  "trade-ins",
  "vehicle-requests",
  // Finance
  "applications",
  "lender-applications",
  "deals",
  "payments",
  // Marketing
  "marketing",
  "social",
  "content",
  "campaigns",
  "reviews",
  "email-marketing",
  // Website
  "website",
  "shop",
  "music",
  "seo",
  "analytics",
  // Operations
  "tasks",
  "calendar",
  "team",
  "documents",
  // System
  "automations",
  "integrations",
  "settings",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/** The rail's headings, in the order they appear. */
export const ADMIN_GROUPS = [
  "command",
  "sales",
  "vehicles",
  "finance",
  "marketing",
  "website",
  "operations",
  "system",
] as const;

export type AdminGroup = (typeof ADMIN_GROUPS)[number];

export const ADMIN_GROUP_LABELS: Record<AdminGroup, string> = {
  command: "Command",
  sales: "Sales",
  vehicles: "Vehicles",
  finance: "Finance",
  marketing: "Marketing",
  website: "Website",
  operations: "Operations",
  system: "System",
};

export type AdminNavItem = {
  key: AdminSection;
  label: string;
  href: string;
  /** Which heading this sits under in the rail. */
  group: AdminGroup;
  /** Roles allowed to open this section. Omitted means any active staff. */
  roles?: readonly UserRole[];
  /** A one-line explanation, shown beside the tick box on the team screen. */
  description: string;
  /** True while the route is a stub, so the rail can say so honestly. */
  planned?: true;
};

/**
 * Admin console navigation, with the role gate alongside each entry so the
 * sidebar and the page guard can never drift apart.
 *
 * Hiding a link is presentation, not security — every page also calls
 * requireSection(), and RLS is the final word on the data itself.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  // ── Command ───────────────────────────────────────────────────────────
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    group: "command",
    description: "The landing screen after signing in.",
  },
  {
    key: "ai",
    label: "AI Command Center",
    href: "/admin/ai",
    group: "command",
    planned: true,
    description: "Where the assistant's suggestions and actions will live.",
  },
  {
    key: "activity",
    label: "Activity Center",
    href: "/admin/activity",
    group: "command",
    planned: true,
    description: "Everything that changed, and who changed it.",
  },

  // ── Sales ─────────────────────────────────────────────────────────────
  {
    key: "leads",
    label: "Leads",
    href: "/admin/leads",
    group: "sales",
    description: "People who asked about a car or filled in a form.",
  },
  {
    key: "crm",
    label: "CRM",
    href: "/admin/crm",
    group: "sales",
    planned: true,
    description: "One combined view of a person and everything they have done.",
  },
  {
    key: "pipeline",
    label: "Pipeline",
    href: "/admin/pipeline",
    group: "sales",
    description: "Deals in progress, stage by stage.",
  },
  {
    key: "customers",
    label: "Customers",
    href: "/admin/customers",
    group: "sales",
    description: "Customer records and history.",
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "/admin/appointments",
    group: "sales",
    description: "Test drives and visits.",
  },
  {
    key: "messages",
    label: "Messages",
    href: "/admin/messages",
    group: "sales",
    description: "Conversations with customers.",
  },

  // ── Vehicles ──────────────────────────────────────────────────────────
  {
    key: "inventory",
    label: "Inventory",
    href: "/admin/inventory",
    group: "vehicles",
    description: "Add and edit vehicles, photos and prices.",
  },
  {
    key: "partner-lots",
    label: "Partner Lots",
    href: "/admin/partner-lots",
    group: "vehicles",
    description: "The lots whose inventory we list.",
  },
  {
    key: "trade-ins",
    label: "Trade-Ins",
    href: "/admin/trade-ins",
    group: "vehicles",
    description: "Vehicles customers want to trade.",
  },
  {
    key: "vehicle-requests",
    label: "Vehicle Requests",
    href: "/admin/vehicle-requests",
    group: "vehicles",
    planned: true,
    description: "Find-my-car requests for cars not on the lot.",
  },

  // ── Finance ───────────────────────────────────────────────────────────
  {
    key: "applications",
    label: "Prequalifications",
    href: "/admin/applications",
    group: "finance",
    description: "Finance enquiries from the website.",
  },
  {
    key: "lender-applications",
    label: "Applications",
    href: "/admin/lender-applications",
    group: "finance",
    planned: true,
    description: "Applications handed to a lender, and what came back.",
  },
  {
    key: "deals",
    label: "Deals",
    href: "/admin/deals",
    group: "finance",
    planned: true,
    description: "Sales being worked, from selection to delivery.",
  },
  {
    key: "payments",
    label: "Payments",
    href: "/admin/payments",
    group: "finance",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "Money taken and money owed.",
  },

  // ── Marketing ─────────────────────────────────────────────────────────
  {
    key: "marketing",
    label: "Marketing Dashboard",
    href: "/admin/marketing",
    group: "marketing",
    planned: true,
    description: "How the advertising is doing, in one place.",
  },
  {
    key: "social",
    label: "Social Center",
    href: "/admin/social",
    group: "marketing",
    planned: true,
    description: "Posts and performance across the social accounts.",
  },
  {
    key: "content",
    label: "Content Studio",
    href: "/admin/content",
    group: "marketing",
    planned: true,
    description: "Write and schedule posts, photos and video.",
  },
  {
    key: "campaigns",
    label: "Campaigns",
    href: "/admin/campaigns",
    group: "marketing",
    planned: true,
    description: "Paid and organic pushes, and what they cost.",
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    group: "marketing",
    planned: true,
    description: "Customer reviews waiting to be approved or answered.",
  },
  {
    key: "email-marketing",
    label: "Email Marketing",
    href: "/admin/email-marketing",
    group: "marketing",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "Mail-outs to the customer list.",
  },

  // ── Website ───────────────────────────────────────────────────────────
  {
    key: "website",
    label: "Website",
    href: "/admin/website",
    group: "website",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "The public pages and what they say.",
  },
  {
    key: "shop",
    label: "Merch Store",
    href: "/admin/shop",
    group: "website",
    description: "Products, pictures, prices and stock.",
  },
  {
    key: "music",
    label: "Music",
    href: "/admin/music",
    group: "website",
    planned: true,
    description: "The tracks and releases on the music page.",
  },
  {
    key: "seo",
    label: "SEO",
    href: "/admin/seo",
    group: "website",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "How the site shows up in search.",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    group: "website",
    roles: FULL_ACCESS_ROLES,
    description: "Traffic and performance figures.",
  },

  // ── Operations ────────────────────────────────────────────────────────
  {
    key: "tasks",
    label: "Tasks",
    href: "/admin/tasks",
    group: "operations",
    planned: true,
    description: "What each person needs to get done.",
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/admin/calendar",
    group: "operations",
    planned: true,
    description: "Appointments and deadlines on one calendar.",
  },
  {
    key: "team",
    label: "Team",
    href: "/admin/team",
    group: "operations",
    roles: FULL_ACCESS_ROLES,
    description: "Invite staff and set what they can reach.",
  },
  {
    key: "documents",
    label: "Documents",
    href: "/admin/documents",
    group: "operations",
    planned: true,
    description: "Paperwork kept against a deal or a vehicle.",
  },

  // ── System ────────────────────────────────────────────────────────────
  {
    key: "automations",
    label: "Automations",
    href: "/admin/automations",
    group: "system",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "Rules that do something on their own.",
  },
  {
    key: "integrations",
    label: "Integrations",
    href: "/admin/integrations",
    group: "system",
    roles: FULL_ACCESS_ROLES,
    planned: true,
    description: "The outside accounts this console is connected to.",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    group: "system",
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

export type AdminNavGroup = {
  key: AdminGroup;
  label: string;
  items: readonly AdminNavItem[];
};

/**
 * The same list, under its headings, with empty headings dropped.
 *
 * Grouping happens here rather than in the sidebar so the rail, the mobile
 * drawer and the team screen all show one structure.
 */
export function groupNav(
  items: readonly AdminNavItem[],
): readonly AdminNavGroup[] {
  return ADMIN_GROUPS.map((key) => ({
    key,
    label: ADMIN_GROUP_LABELS[key],
    items: items.filter((item) => item.group === key),
  })).filter((group) => group.items.length > 0);
}
