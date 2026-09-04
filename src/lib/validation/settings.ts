import { z } from "zod";

const trimToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v;

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v);

const checkbox = (v: unknown) => v === "on" || v === "true" || v === true;

/**
 * A social or announcement link.
 *
 * Only http(s) is allowed. Without that check a `javascript:` URL typed into
 * the settings form would end up in an href on every page of the site, which
 * turns an admin form into a way to run script on visitors.
 */
const httpUrl = z.preprocess(
  trimToNull,
  z
    .string()
    .max(500, "That link is too long.")
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a full web address starting with https://")
    .nullable(),
);

export const BusinessSchema = z.object({
  phone: z.preprocess(
    trim,
    z
      .string()
      .min(7, "Add a phone number.")
      .max(32, "That phone number is too long."),
  ),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("That does not look like an email address.").max(160),
  ),
  addressLine1: z.preprocess(trim, z.string().min(3, "Add a street address.").max(160)),
  // Suite numbers are genuinely optional, so blank is a valid answer here.
  addressLine2: z.preprocess(trimToNull, z.string().max(80).nullable()),
  city: z.preprocess(trim, z.string().min(2, "Add a city.").max(80)),
  state: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z.string().length(2, "Use the two-letter state code, like TX."),
  ),
  postalCode: z.preprocess(
    trim,
    z.string().regex(/^\d{5}(-\d{4})?$/, "Use a 5-digit ZIP, like 76541."),
  ),
});

export const SocialsSchema = z.object({
  facebookUrl: httpUrl,
  instagramUrl: httpUrl,
  tiktokUrl: httpUrl,
  snapchatUrl: httpUrl,
  youtubeUrl: httpUrl,
  linktreeUrl: httpUrl,
});

export const SwitchesSchema = z
  .object({
    shopCheckoutEnabled: z.preprocess(checkbox, z.boolean()),
    showInventoryPrices: z.preprocess(checkbox, z.boolean()),
    announcementEnabled: z.preprocess(checkbox, z.boolean()),
    announcementText: z.preprocess(
      trimToNull,
      z.string().max(240, "Keep the banner under 240 characters.").nullable(),
    ),
    announcementHref: httpUrl,
  })
  // Mirrors the database constraint. Catching it here means Cory gets a
  // sentence instead of a Postgres error.
  .refine(
    (value) => !value.announcementEnabled || Boolean(value.announcementText),
    {
      path: ["announcementText"],
      message: "Write the banner message before switching it on.",
    },
  );

export const NotificationsSchema = z.object({
  leadsEmail: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("That does not look like an email address.").max(160).nullable(),
  ),
  messagesEmail: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("That does not look like an email address.").max(160).nullable(),
  ),
});

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** One weekday. Closed days keep whatever times were last typed, unused. */
export const DaySchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    isClosed: z.preprocess(checkbox, z.boolean()),
    opens: z.preprocess(trimToNull, z.string().regex(TIME).nullable()),
    closes: z.preprocess(trimToNull, z.string().regex(TIME).nullable()),
  })
  .refine((d) => d.isClosed || (d.opens !== null && d.closes !== null), {
    path: ["opens"],
    message: "Set both times, or mark the day closed.",
  })
  .refine((d) => d.isClosed || (d.opens ?? "") < (d.closes ?? ""), {
    path: ["closes"],
    message: "Closing time has to be after opening time.",
  });

export const HoursSchema = z.object({
  days: z.array(DaySchema).length(7, "All seven days are required."),
});

export type BusinessInput = z.infer<typeof BusinessSchema>;
export type SocialsInput = z.infer<typeof SocialsSchema>;
export type SwitchesInput = z.infer<typeof SwitchesSchema>;
export type NotificationsInput = z.infer<typeof NotificationsSchema>;
export type HoursInput = z.infer<typeof HoursSchema>;

export const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * The two lines of type under the sign-in mark.
 *
 * Both may be left blank, which means "use the name compiled into the code"
 * rather than "show nothing" — a sign-in screen with no business name on it
 * is a bug, not a design choice.
 */
export const BrandTextSchema = z.object({
  brandWordmark: z.preprocess(
    trimToNull,
    z.string().max(60, "That name is too long for the sign-in screen.").nullable(),
  ),
  brandTagline: z.preprocess(
    trimToNull,
    z.string().max(80, "That line is too long for the sign-in screen.").nullable(),
  ),
});

/**
 * A storage path handed back by the uploader.
 *
 * Rejects anything that is not a plain relative path. The browser uploads
 * straight to Storage and then tells a Server Action where it put the file,
 * so this value arrives from the client and is written into an image `src`:
 * a full URL, a protocol, a leading slash or a `..` segment would each turn
 * that into a way to point the site's own logo at somebody else's server.
 * The same rule is a check constraint on the column.
 */
export const BrandPathSchema = z
  .string()
  .min(1, "That upload did not arrive.")
  .max(300, "That file name is too long.")
  .refine((value) => !/^[a-zA-Z]+:/.test(value), "That is not a stored file.")
  .refine((value) => !value.startsWith("/"), "That is not a stored file.")
  .refine((value) => !value.includes(".."), "That is not a stored file.");
