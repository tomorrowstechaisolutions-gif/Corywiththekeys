/**
 * Static brand + business constants for The Key Konnect.
 * Everything here is safe to render on the client.
 */

export const SITE = {
  name: "The Key Konnect",
  personality: "Cory With The Keys",
  headline: "THE OFFICIAL CAR PLUG OF THE PEOPLE",
  tagline: "Your Key. Your Car. Your Konnect.",
  domain: "thekeykonnect.com",
  url: "https://thekeykonnect.com",
} as const;

export const CONTACT = {
  phone: "254-987-0063",
  phoneHref: "tel:+12549870063",
  email: "info@thekeykonnect.com",
  address: {
    line1: "502 E Veterans Memorial Blvd",
    line2: "Suite B",
    city: "Killeen",
    state: "TX",
    postalCode: "76541",
  },
} as const;

export const HOURS = [
  { days: "Monday – Friday", hours: "9:00 AM – 7:00 PM" },
  { days: "Saturday", hours: "10:00 AM – 5:00 PM" },
  { days: "Sunday", hours: "Closed" },
] as const;

/** Primary public navigation. */
export const SITE_NAV = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "Financing", href: "/financing" },
  { label: "Trade-In", href: "/trade-in" },
  { label: "Reviews", href: "/reviews" },
  { label: "Music", href: "/music" },
  { label: "Shop", href: "/shop" },
  { label: "Media", href: "/media" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Admin console navigation. */
export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Pipeline", href: "/admin/pipeline" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Trade-Ins", href: "/admin/trade-ins" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Partner Lots", href: "/admin/partner-lots" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" },
] as const;
