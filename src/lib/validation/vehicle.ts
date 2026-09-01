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

    price: money,
    monthly_payment: money,
    down_payment: money,

    description: text(4000),
    features: featureList,

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
