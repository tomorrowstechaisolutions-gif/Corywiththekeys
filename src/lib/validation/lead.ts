import { z } from "zod";

/**
 * Public lead capture.
 *
 * Contact details and shopping preferences only. No employment, income,
 * date of birth or anything a lender would need — this form's job is to get
 * Cory on the phone with someone, not to prequalify them.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optional = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(max, `Keep this under ${max} characters.`).nullable(),
  );

/** Digits only, then formatted to E.164. Rejects anything that is not a real US number. */
const usPhone = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z
    .string()
    .min(1, "We need a phone number to reach you.")
    .transform((value, ctx) => {
      const digits = value.replace(/\D/g, "");
      const national = digits.length === 11 && digits.startsWith("1")
        ? digits.slice(1)
        : digits;

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

export const VEHICLE_TYPE_OPTIONS = [
  "Any Type",
  "Car",
  "Truck",
  "SUV",
  "Van",
  "Coupe",
  "Convertible",
] as const;

export const FindMyCarSchema = z.object({
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
  vehicleType: optional(40),
  makeModel: optional(120),
  budget: optional(60),
});

export type FindMyCarInput = z.infer<typeof FindMyCarSchema>;

/**
 * Turn the shopping preferences into the free-text message stored on the
 * lead, so nothing the customer told us is lost even though the columns for
 * it do not exist yet.
 */
export function buildLeadMessage(input: FindMyCarInput): string {
  const parts = [
    input.vehicleType && input.vehicleType !== "Any Type"
      ? `Vehicle type: ${input.vehicleType}`
      : null,
    input.makeModel ? `Looking for: ${input.makeModel}` : null,
    input.budget ? `Budget / payment: ${input.budget}` : null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join("\n")
    : "Asked Cory to help find a vehicle.";
}
