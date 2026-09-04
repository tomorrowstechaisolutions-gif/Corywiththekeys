import type { AdminSection } from "@/lib/admin-nav";

/**
 * Line icons for the navigation rail.
 *
 * Hand-drawn paths rather than an icon package: the console needs about
 * thirty glyphs at one size and one weight, and every icon library worth
 * installing ships a few thousand. These are 24×24, 1.75 stroke, and inherit
 * `currentColor` so the active and hover states need no icon-specific rules.
 */
const PATHS: Record<AdminSection, string> = {
  // Command
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  ai: "M12 3v3m0 12v3M3 12h3m12 0h3M7.5 7.5 9 9m6 6 1.5 1.5m0-9L15 9M9 15l-1.5 1.5M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  activity: "M3 12h4l3 8 4-16 3 8h4",
  // Sales
  leads: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm11 15v-1a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8",
  crm: "M4 5h16v14H4zM4 10h16M9 10v9",
  pipeline: "M3 6h18l-6 7v5l-6 2v-7L3 6Z",
  customers: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0",
  appointments: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4m-6 8h4",
  messages: "M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z",
  // Vehicles
  inventory:
    "M5 17h14M5 17a2 2 0 1 1-.001-.001M19 17a2 2 0 1 1-.001-.001M3 13h18l-1.6-4.4A2 2 0 0 0 17.5 7h-11a2 2 0 0 0-1.9 1.6L3 13Z",
  "partner-lots": "M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6",
  "trade-ins": "M4 8h11l-3-3m8 11H9l3 3",
  "vehicle-requests":
    "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5.5-1.5L21 21",
  // Finance
  applications: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h4",
  "lender-applications": "M6 3h8l4 4v14H6zM14 3v4h4M9 13l2 2 4-4",
  deals: "M8 12h8M8 16h5M4 4h16v16H4zM4 8h16",
  payments: "M3 7h18v11H3zM3 11h18M7 15h3",
  // Marketing
  marketing: "M4 20V10m5 10V4m5 16v-7m5 7V7",
  social: "M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 10.6l6.8-3.2M8.6 13.4l6.8 3.2",
  content: "M4 20h16M6 16l10-10 2 2-10 10-3 1 1-3Z",
  campaigns: "M4 10v4h3l6 4V6l-6 4H4Zm13-1a4 4 0 0 1 0 6",
  reviews:
    "m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8L12 4Z",
  "email-marketing": "M3 6h18v12H3zM3 7l9 6 9-6",
  // Website
  website: "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm0 0h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z",
  shop: "M5 8h14l-1 12H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2",
  music: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  seo: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5.5-1.5L21 21M8.5 11h5M11 8.5v5",
  analytics: "M4 19h16M7 16V9m5 7V5m5 11v-4",
  // Operations
  tasks: "M4 6.5 6 8.5 9.5 5M4 15.5l2 2 3.5-3.5M13 7h7M13 16h7",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4",
  team: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0M19 8a2.5 2.5 0 1 0 0-5",
  documents: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  // System
  automations: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
  integrations:
    "M10 4H5v5h5V4Zm9 0h-5v5h5V4Zm-9 11H5v5h5v-5Zm4-1.5h5m-2.5-2.5v5",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-2.1a8.5 8.5 0 0 0 0-1.8l2-1.5-2-3.4-2.3.9a8.5 8.5 0 0 0-1.6-.9L16.1 4h-4l-.4 2.2a8.5 8.5 0 0 0-1.6.9l-2.3-.9-2 3.4 1.9 1.5a8.5 8.5 0 0 0 0 1.8l-1.9 1.5 2 3.4 2.3-.9c.5.4 1 .7 1.6.9l.4 2.2h4l.4-2.2c.6-.2 1.1-.5 1.6-.9l2.3.9 2-3.4-1.9-1.5Z",
};

export function NavIcon({
  name,
  className = "h-4 w-4",
}: {
  name: AdminSection;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
