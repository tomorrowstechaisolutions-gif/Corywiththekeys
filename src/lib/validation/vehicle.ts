import { z } from "zod";

/**
 * Vehicle form validation.
 *
 * Every enum here is spelled out to match the database enum exactly. If a
 * migration changes one, this file fails to compile against the regenerated
 * types rather than silently writing a value Postgres will reject.
 */

export const VEHICLE_STATUSES = [
  "draft",
  "available",
  "pending",
  "sold",
  "archived",
] as const;

export const VEHICLE_SOURCES = ["owned", "partner"] as const;

export const TITLE_STATUSES = [
  "clean",
  "salvage",
  "rebuilt",
  "flood",
  "lemon",
  "not_disclosed",
] as const;

export const WARRANTY_STATUSES = [
  "as_is",
  "remaining_factory",
  "dealer_warranty",
  "certified",
  "not_specified",
] as const;

export type TitleStatus = (typeof TITLE_STATUSES)[number];
export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];

export const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  clean: "Clean title",
  salvage: "Salvage title",
  rebuilt: "Rebuilt / reconstructed title",
  flood: "Flood damage",
  lemon: "Manufacturer buyback (lemon law)",
  not_disclosed: "Not disclosed yet",
};

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  as_is: "Sold as-is, no warranty",
  remaining_factory: "Remaining factory warranty",
  dealer_warranty: "Dealer warranty included",
  certified: "Certified pre-owned",
  not_specified: "Not specified yet",
};

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Optional free text — trimmed, capped, empty becomes null. */
const text = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(max, `Keep this under ${max} characters.`).nullable(),
  );

/** Required free text. */
const requiredText = (max: number, label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(1, `${label} is required.`)
      .max(max, `Keep ${label.toLowerCase()} under ${max} characters.`),
  );

const money = z.preprocess((v) => {
  const value = emptyToNull(v);
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isNaN(n) ? value : n;
}, z.number().min(0, "Cannot be negative.").max(9_999_999, "That is too large.").nullable());

const wholeNumber = (max: number) =>
  z.preprocess((v) => {
    const value = emptyToNull(v);
    if (value === null || value === undefined) return null;
    const n = Number(String(value).replace(/[,\s]/g, ""));
    return Number.isNaN(n) ? value : n;
  }, z.number().int("Whole numbers only.").min(0, "Cannot be negative.").max(max, "That is too large.").nullable());

const checkbox = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

/** Comma-separated in the form, text[] in the database. */
const featureList = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return [];
  return v
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 60);
}, z.array(z.string().max(80)).max(60));

/**
 * A link we will render as a button. Only http(s) — a `javascript:` URL in an
 * href is a stored XSS, and these fields are typed by staff into a form that
 * ends up on a public page.
 */
const url = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z
      .string()
      .max(max)
      .refine(
        (value) => /^https?:\/\//i.test(value),
        "Paste the full link, starting with https://",
      )
      .nullable(),
  );

const uuidOrNull = z.preprocess(
  emptyToNull,
  z.string().uuid("Pick a partner lot from the list.").nullable(),
);

export const VehicleSchema = z
  .object({
    year: z.preprocess(
      (v) => {
        const value = emptyToNull(v);
        if (value === null || value === undefined) return value;
        const n = Number(value);
        return Number.isNaN(n) ? value : n;
      },
      z
        .number()
        .int("Enter a four-digit year.")
        .min(1900, "Year looks too early.")
        .max(new Date().getFullYear() + 2, "Year looks too far ahead."),
    ),
    make: requiredText(60, "Make"),
    model: requiredText(60, "Model"),
    trim: text(60),

    vin: z.preprocess(
      (v) =>
        typeof v === "string" ? emptyToNull(v.trim().toUpperCase()) : emptyToNull(v),
      z
        .string()
        .regex(
          /^[A-HJ-NPR-Z0-9]{17}$/,
          "A VIN is 17 characters and never contains I, O or Q.",
        )
        .nullable(),
    ),
    stock_number: text(40),

    body_type: text(40),
    mileage: wholeNumber(2_000_000),
    exterior_color: text(40),
    interior_color: text(40),
    transmission: text(40),
    drivetrain: text(40),
    fuel_type: text(40),
    engine: text(60),
    cylinders: wholeNumber(16),
    doors: wholeNumber(8),
    seating: wholeNumber(20),
    mpg_city: wholeNumber(200),
    mpg_highway: wholeNumber(200),

    price: money,
    monthly_payment: money,
    down_payment: money,

    description: text(4000),
    features: featureList,

    title_status: z.enum(TITLE_STATUSES),
    history_report_url: url(500),
    warranty_status: z.enum(WARRANTY_STATUSES),
    warranty_details: text(500),
    video_url: url(500),

    status: z.enum(VEHICLE_STATUSES),
    is_featured: checkbox,

    source: z.enum(VEHICLE_SOURCES),
    partner_lot_id: uuidOrNull,
  })
  // Mirrors the vehicles_partner_requires_lot check constraint, so the user
  // gets a field-level message instead of a raw Postgres error.
  .refine((data) => data.source !== "partner" || data.partner_lot_id !== null, {
    message: "Pick which partner lot this vehicle belongs to.",
    path: ["partner_lot_id"],
  })
  // Publishing without answering the title question is how an undisclosed
  // branded title reaches a buyer. Draft is fine; live is not.
  .refine(
    (data) =>
      !["available", "pending"].includes(data.status) ||
      data.title_status !== "not_disclosed",
    {
      message:
        "Say what the title is before publishing. Buyers are entitled to know, and “not disclosed” must never be what a live listing says.",
      path: ["title_status"],
    },
  )
  // A published vehicle with no price is a support call waiting to happen.
  .refine(
    (data) =>
      !["available", "pending"].includes(data.status) || data.price !== null,
    {
      message: "Set a price before publishing this vehicle.",
      path: ["price"],
    },
  );

export type VehicleInput = z.infer<typeof VehicleSchema>;

export const PartnerLotSchema = z.object({
  name: requiredText(120, "Name"),
  contact_name: text(120),
  contact_email: z.preprocess(
    (v) =>
      typeof v === "string" ? emptyToNull(v.trim().toLowerCase()) : emptyToNull(v),
    z.string().email("That does not look like an email address.").nullable(),
  ),
  contact_phone: text(40),
  address_line1: text(160),
  city: text(80),
  state: text(40),
  postal_code: text(20),
  commission_notes: text(2000),
  display_on_site: checkbox,
  is_active: checkbox,
  notes: text(2000),
});

export type PartnerLotInput = z.infer<typeof PartnerLotSchema>;
