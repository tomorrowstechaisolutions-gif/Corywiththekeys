import "server-only";

import { cache } from "react";
import { unstable_rethrow } from "next/navigation";

import { createPublicClient } from "@/lib/supabase/server";
import { BRAND_FALLBACKS, brandImageUrl } from "@/lib/brand";
import { CONTACT, HOURS, SITE, SOCIAL_LINKS } from "@/lib/constants";
import type { SocialIconName } from "@/components/ui/SocialIcon";
import type { Database } from "@/types/database";

type SettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type HoursRow = Database["public"]["Tables"]["business_hours"]["Row"];

export type SiteSettings = {
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  /** Ready to render: consecutive identical days already grouped. */
  hours: { days: string; hours: string }[];
  /**
   * The same seven days unformatted. Search engines want machine times
   * ("09:00"), not "9:00 AM – 7:00 PM", so structured data is built from
   * this rather than from the display strings above.
   */
  schedule: { day: number; isClosed: boolean; opens: string; closes: string }[];
  socials: { label: string; icon: SocialIconName; href: string | null }[];
  switches: {
    shopCheckoutEnabled: boolean;
    showInventoryPrices: boolean;
  };
  announcement: { text: string; href: string | null } | null;
  /**
   * The marks and wording, already resolved to something renderable.
   *
   * A null URL means "no image for this one" — the caller falls back to type,
   * or to Next's own icon file. The two strings are never null: an unset
   * wordmark is the name compiled into the code, not a blank space where the
   * business name should be.
   */
  brand: {
    loginLogoUrl: string | null;
    adminMarkUrl: string | null;
    faviconUrl: string | null;
    wordmark: string;
    tagline: string;
  };
  /**
   * True when the values above came from the code rather than the database.
   * The admin screen surfaces this so a save that silently did nothing is
   * visible instead of mysterious.
   */
  usedFallback: boolean;
};

/** What the site shows if the database cannot be reached. */
function fallback(): SiteSettings {
  return {
    contact: {
      phone: CONTACT.phone,
      phoneHref: CONTACT.phoneHref,
      email: CONTACT.email,
      address: { ...CONTACT.address },
    },
    hours: HOURS.map((entry) => ({ ...entry })),
    // Matches the HOURS constant above: Mon-Fri 9-7, Sat 10-5, Sun closed.
    schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      isClosed: day === 6,
      opens: day === 5 ? "10:00" : "09:00",
      closes: day === 5 ? "17:00" : "19:00",
    })),
    socials: SOCIAL_LINKS.map((social) => ({ ...social })),
    switches: { shopCheckoutEnabled: false, showInventoryPrices: true },
    announcement: null,
    brand: {
      loginLogoUrl: BRAND_FALLBACKS.login_logo,
      adminMarkUrl: BRAND_FALLBACKS.admin_mark,
      faviconUrl: BRAND_FALLBACKS.favicon,
      wordmark: SITE.name,
      tagline: SITE.tagline,
    },
    usedFallback: true,
  };
}

/** "254-987-0063" → "tel:+12549870063". Anything already a tel: is left be. */
export function telHref(phone: string): string {
  if (phone.startsWith("tel:")) return phone;

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits || phone}`;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** "09:00:00" → "9:00 AM". */
function formatTime(value: string): string {
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = rawMinute ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minute} ${suffix}`;
}

/**
 * Seven rows in, a readable list out.
 *
 * Consecutive days that keep the same hours are collapsed into a range, so
 * setting the same times Monday to Friday produces "Monday – Friday" by
 * itself and Cory never has to think about how it will read.
 */
export function groupHours(rows: HoursRow[]): { days: string; hours: string }[] {
  const byDay = [...rows].sort((a, b) => a.day_of_week - b.day_of_week);

  // Build runs first, then label them. Doing both at once is what makes this
  // kind of function hard to read and easy to get wrong.
  const runs: { first: number; last: number; hours: string }[] = [];

  for (const row of byDay) {
    const label = row.is_closed
      ? "Closed"
      : `${formatTime(row.opens ?? "")} – ${formatTime(row.closes ?? "")}`;

    const open = runs.at(-1);
    const continuesRun =
      open !== undefined &&
      open.hours === label &&
      open.last === row.day_of_week - 1;

    if (continuesRun) {
      open.last = row.day_of_week;
    } else {
      runs.push({ first: row.day_of_week, last: row.day_of_week, hours: label });
    }
  }

  return runs.map((run) => ({
    days:
      run.first === run.last
        ? DAY_NAMES[run.first]
        : `${DAY_NAMES[run.first]} – ${DAY_NAMES[run.last]}`,
    hours: run.hours,
  }));
}

function socialsFrom(row: SettingsRow) {
  const map: { label: string; icon: SocialIconName; href: string | null }[] = [
    { label: "Facebook", icon: "facebook", href: row.facebook_url },
    { label: "Instagram", icon: "instagram", href: row.instagram_url },
    { label: "TikTok", icon: "tiktok", href: row.tiktok_url },
    { label: "Snapchat", icon: "snapchat", href: row.snapchat_url },
    { label: "YouTube", icon: "youtube", href: row.youtube_url },
    { label: "Linktree", icon: "linktree", href: row.linktree_url },
  ];

  // A blank field means "we do not have this one", not "link to nowhere".
  return map.map((entry) => ({
    ...entry,
    href: entry.href && entry.href.trim() !== "" ? entry.href.trim() : null,
  }));
}

/**
 * The live business configuration.
 *
 * Wrapped in React's `cache`, so a page that shows the phone number in the
 * header, the footer and a form still costs one query.
 *
 * If anything at all goes wrong — the database is down, the row is missing,
 * a migration has not run yet — this returns the values compiled into the
 * code instead of throwing. A dealership site that renders without a phone
 * number is worse than one showing a slightly stale one.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    // Deliberately the cookie-free client. These tables are readable by
    // anyone, and touching cookies here would drag every public page out of
    // static rendering to fetch information that is the same for everybody.
    const supabase = createPublicClient();

    const [settingsResult, hoursResult] = await Promise.all([
      supabase.from("site_settings").select("*").maybeSingle(),
      supabase.from("business_hours").select("*").order("day_of_week"),
    ]);

    const row = settingsResult.data;
    if (settingsResult.error || !row) {
      if (settingsResult.error) {
        console.error("[settings] read failed", settingsResult.error.message);
      }
      return fallback();
    }

    const base = fallback();
    const phone = row.phone?.trim() || base.contact.phone;
    const hoursRows = hoursResult.data ?? [];

    return {
      contact: {
        phone,
        phoneHref: telHref(phone),
        email: row.email?.trim() || base.contact.email,
        address: {
          line1: row.address_line1?.trim() || base.contact.address.line1,
          line2: row.address_line2?.trim() ?? "",
          city: row.city?.trim() || base.contact.address.city,
          state: row.state?.trim() || base.contact.address.state,
          postalCode: row.postal_code?.trim() || base.contact.address.postalCode,
        },
      },
      hours: hoursRows.length > 0 ? groupHours(hoursRows) : base.hours,
      schedule:
        hoursRows.length > 0
          ? hoursRows.map((row) => ({
              day: row.day_of_week,
              isClosed: row.is_closed,
              opens: (row.opens ?? "09:00").slice(0, 5),
              closes: (row.closes ?? "17:00").slice(0, 5),
            }))
          : base.schedule,
      socials: socialsFrom(row),
      switches: {
        shopCheckoutEnabled: row.shop_checkout_enabled,
        showInventoryPrices: row.show_inventory_prices,
      },
      announcement:
        row.announcement_enabled && row.announcement_text?.trim()
          ? {
              text: row.announcement_text.trim(),
              href: row.announcement_href?.trim() || null,
            }
          : null,
      /*
       * `?? null` on each path is doing real work: until migration 0026 is
       * applied these columns do not exist, so `select("*")` simply does not
       * return them and the property is undefined rather than null. Reading
       * them defensively means the sign-in screen and the tab icon keep
       * working on an un-migrated database instead of throwing.
       */
      brand: {
        loginLogoUrl:
          brandImageUrl(row.login_logo_path ?? null) ??
          BRAND_FALLBACKS.login_logo,
        adminMarkUrl:
          brandImageUrl(row.admin_mark_path ?? null) ??
          BRAND_FALLBACKS.admin_mark,
        faviconUrl:
          brandImageUrl(row.favicon_path ?? null) ?? BRAND_FALLBACKS.favicon,
        wordmark: row.brand_wordmark?.trim() || base.brand.wordmark,
        tagline: row.brand_tagline?.trim() || base.brand.tagline,
      },
      usedFallback: false,
    };
  } catch (error) {
    // Next signals things like "this page has to be dynamic" by throwing.
    // Swallowing those would break the framework in ways that only show up
    // as a stale page in production, so they are rethrown untouched and only
    // genuine database failures fall through to the compiled defaults.
    unstable_rethrow(error);

    console.error("[settings] unavailable, using compiled defaults", error);
    return fallback();
  }
});

/** The full address on one line, for maps links and structured data. */
export function addressLine(settings: SiteSettings): string {
  const { line1, line2, city, state, postalCode } = settings.contact.address;
  return [line1, line2, `${city}, ${state} ${postalCode}`]
    .filter((part) => part.trim() !== "")
    .join(", ");
}

const SCHEMA_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * schema.org opening hours, built from the saved times.
 *
 * Days sharing the same times are listed together, which is the shape
 * Google's examples use. Closed days are simply left out — schema.org has no
 * way to say "closed" in this property, and listing a day with no times is
 * worse than omitting it.
 */
export function openingHoursSpecification(settings: SiteSettings) {
  const groups = new Map<string, { days: string[]; opens: string; closes: string }>();

  for (const day of [...settings.schedule].sort((a, b) => a.day - b.day)) {
    if (day.isClosed) continue;
    const key = `${day.opens}-${day.closes}`;
    const existing = groups.get(key);
    if (existing) {
      existing.days.push(SCHEMA_DAYS[day.day]);
    } else {
      groups.set(key, {
        days: [SCHEMA_DAYS[day.day]],
        opens: day.opens,
        closes: day.closes,
      });
    }
  }

  return [...groups.values()].map((group) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: group.days,
    opens: group.opens,
    closes: group.closes,
  }));
}
