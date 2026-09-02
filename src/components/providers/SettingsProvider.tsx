"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SiteSettings } from "@/lib/settings";
import { CONTACT, HOURS, SOCIAL_LINKS } from "@/lib/constants";

/**
 * Live business settings, for the parts of the site that run in the browser.
 *
 * Server components call `getSettings()` directly. Client components — the
 * forms, the cart, the mobile menu — cannot, so the layout reads the settings
 * once on the server and hands them down through this provider. One query per
 * page either way.
 *
 * The default value is the compiled-in configuration, so a component rendered
 * outside the provider still shows a real phone number rather than blank.
 */
const DEFAULT: SiteSettings = {
  contact: {
    phone: CONTACT.phone,
    phoneHref: CONTACT.phoneHref,
    email: CONTACT.email,
    address: { ...CONTACT.address },
  },
  hours: HOURS.map((entry) => ({ ...entry })),
  schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    isClosed: day === 6,
    opens: day === 5 ? "10:00" : "09:00",
    closes: day === 5 ? "17:00" : "19:00",
  })),
  socials: SOCIAL_LINKS.map((social) => ({ ...social })),
  switches: { shopCheckoutEnabled: false, showInventoryPrices: true },
  announcement: null,
  usedFallback: true,
};

const SettingsContext = createContext<SiteSettings>(DEFAULT);

export function SettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}
