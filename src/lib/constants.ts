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

/**
 * Social profiles. Placeholder URLs until Cory confirms the real handles —
 * the labels are correct, only the hrefs need swapping.
 */
export const SOCIAL_LINKS = [
  { label: "Facebook", short: "f", href: "https://facebook.com/" },
  { label: "Instagram", short: "ig", href: "https://instagram.com/" },
  { label: "TikTok", short: "tt", href: "https://tiktok.com/" },
  { label: "YouTube", short: "yt", href: "https://youtube.com/" },
] as const;
