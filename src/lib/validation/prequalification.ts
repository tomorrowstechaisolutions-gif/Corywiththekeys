import { z } from "zod";

import type { Database } from "@/types/database";

/**
 * Homepage "Get Approved Fast" form.
 *
 * Prequalification only. Income and down payment are BANDS, never exact
 * figures, and there is no date of birth, SSN, licence number or account
 * data anywhere in this form — see 0001_init.sql for why.
 */

type EmploymentStatus = Database["public"]["Enums"]["employment_status"];
type IncomeRange = Database["public"]["Enums"]["income_range"];
type DownPaymentRange = Database["public"]["Enums"]["down_payment_range"];

/** Labels shown to a shopper, mapped to the database enum values. */
export const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: "prefer_not_to_say", label: "Time at job" },
  { value: "employed_full_time", label: "Full-time employed" },
  { value: "employed_part_time", label: "Part-time employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "military", label: "Military" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "not_employed", label: "Not currently employed" },
];

export const INCOME_OPTIONS: { value: IncomeRange; label: string }[] = [
  { value: "prefer_not_to_say", label: "Monthly income" },
  { value: "under_2000", label: "Under $2,000/mo" },
  { value: "from_2000_to_2999", label: "$2,000 – $2,999/mo" },
  { value: "from_3000_to_3999", label: "$3,000 – $3,999/mo" },
  { value: "from_4000_to_4999", label: "$4,000 – $4,999/mo" },
  { value: "from_5000_to_6999", label: "$5,000 – $6,999/mo" },
  { value: "from_7000_plus", label: "$7,000+/mo" },
];

export const DOWN_PAYMENT_OPTIONS: { value: DownPaymentRange; label: string }[] = [
  { value: "undecided", label: "Down payment" },
  { value: "none", label: "No money down" },
  { value: "under_500", label: "Under $500" },
  { value: "from_500_to_999", label: "$500 – $999" },
  { value: "from_1000_to_2499", label: "$1,000 – $2,499" },
  { value: "from_2500_to_4999", label: "$2,500 – $4,999" },
  { value: "from_5000_plus", label: "$5,000+" },
];

export const VEHICLE_PREFERENCE_OPTIONS = [
  "Preferred vehicle type",
  "Car",
  "Truck",
  "SUV",
  "Van",
  "Coupe",
  "Convertible",
  "Not sure yet",
] as const;

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const usPhone = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z
    .string()
    .min(1, "We need a phone number to reach you.")
    .transform((value, ctx) => {
      const digits = value.replace(/\D/g, "");
      const national =
        digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

      if (national.length !== 10) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a 10-digit US phone number.",
        });
        return z.NEVER;
      }

      return `+1${national}`;
    }),
);

export const PrequalificationSchema = z.object({
  fullName: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(2, "Please tell us your name.")
      .max(120, "That name is too long."),
  ),
  phone: usPhone,
  email: z.preprocess(
    (v) =>
      typeof v === "string" ? emptyToNull(v.trim().toLowerCase()) : emptyToNull(v),
    z
      .string()
      .email("That does not look like an email address.")
      .max(254)
      .nullable(),
  ),
  employment: z.enum(
    EMPLOYMENT_OPTIONS.map((o) => o.value) as [EmploymentStatus, ...EmploymentStatus[]],
  ),
  monthlyIncomeBand: z.enum(
    INCOME_OPTIONS.map((o) => o.value) as [IncomeRange, ...IncomeRange[]],
  ),
  downPaymentBand: z.enum(
    DOWN_PAYMENT_OPTIONS.map((o) => o.value) as [
      DownPaymentRange,
      ...DownPaymentRange[],
    ],
  ),
  preferredVehicleType: z.preprocess(
    (v) => (v === VEHICLE_PREFERENCE_OPTIONS[0] ? null : emptyToNull(v)),
    z.string().max(40).nullable(),
  ),
  // Explicit opt-in. A missing box is a validation error, not a silent false —
  // this is the record that we were allowed to call them.
  consentContact: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.literal(true, {
      message: "Please agree to be contacted so Cory can get back to you.",
    }),
  ),
});

export type PrequalificationInput = z.infer<typeof PrequalificationSchema>;

/** The wording a person agreed to. Stored so consent is auditable later. */
export const CONSENT_TEXT_VERSION = "2026-09-01-v1";
export const CONSENT_TEXT =
  "I agree that The Key Konnect may call or text me about this enquiry, including by automated means. Message and data rates may apply. Consent is not a condition of purchase.";
