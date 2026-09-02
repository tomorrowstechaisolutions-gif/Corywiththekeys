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
  { label: "Financing", href: "/finance" },
  { label: "Music", href: "/music" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Social profiles. Placeholder URLs until Cory confirms the real handles —
 * the labels are correct, only the hrefs need swapping.
 */
/**
 * Cory's profiles, for the footer and contact page.
 *
 * Every URL here was opened and confirmed to resolve to Cory — not inferred
 * from a handle. A null href is not rendered at all, because a social icon
 * that goes nowhere is worse than one that is absent.
 *
 * Cash App is deliberately absent. See CASH_APP_URL in src/data/cory-links.ts
 * for why a "send money" link does not belong beside car listings.
 */
export const SOCIAL_LINKS: {
  label: string;
  short: string;
  href: string | null;
}[] = [
  {
    label: "Facebook",
    short: "f",
    href: "https://www.facebook.com/iamcorywiththekeys",
  },
  {
    label: "Instagram",
    short: "ig",
    href: "https://www.instagram.com/corywiththekeys",
  },
  // No "ith" — matches his YouTube handle. @corywiththekeys is a dead account.
  { label: "TikTok", short: "tt", href: "https://www.tiktok.com/@corywthekeys" },
  {
    label: "Snapchat",
    short: "sc",
    href: "https://www.snapchat.com/@corywiththekeys",
  },
  { label: "YouTube", short: "yt", href: "https://www.youtube.com/@Corywthekeys" },
  { label: "Linktree", short: "lt", href: "https://linktr.ee/corywiththekeys" },
] as const;
