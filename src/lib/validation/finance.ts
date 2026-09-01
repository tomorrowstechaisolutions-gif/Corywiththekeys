import { z } from "zod";

import { DOWN_PAYMENT_OPTIONS } from "@/lib/validation/prequalification";

/**
 * The optional pre-application lead form on /finance.
 *
 * SHOPPING PREFERENCES ONLY. There is no SSN, ITIN, driver's licence, date of
 * birth, bank information, credit card or credit report field here, and there
 * must never be one — that data belongs to the financing provider, on their
 * secure application, not in our database.
 *
 * Down payment is reused from the prequalification bands rather than being a
 * free-text amount, for the same reason it is banded there: a range is enough
 * for Cory to help, and an exact figure is financial detail we do not need.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optional = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(max, `Keep this under ${max} characters.`).nullable(),
  );

/** Digits only, then formatted to E.164. Required — this is how Cory calls back. */
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

export const CONTACT_METHODS = ["Call", "Text", "Email"] as const;
export const TRADE_IN_OPTIONS = ["No", "Yes"] as const;

export { DOWN_PAYMENT_OPTIONS };

export const FinanceLeadSchema = z.object({
  firstName: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "Please tell us your first name.").max(80),
  ),
  lastName: optional(80),
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
  vehicle: optional(160),
  downPaymentBand: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z
      .enum(
        DOWN_PAYMENT_OPTIONS.map((o) => o.value) as [string, ...string[]],
        { message: "Pick the closest range." },
      )
      .nullable(),
  ),
  tradeIn: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.enum(TRADE_IN_OPTIONS).nullable(),
  ),
  lookingFor: optional(1500),
  contactMethod: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.enum(CONTACT_METHODS).nullable(),
  ),
});

export type FinanceLeadInput = z.infer<typeof FinanceLeadSchema>;

/**
 * Everything the customer told us, as the lead's message.
 *
 * The `leads` table has no columns for vehicle interest or down payment, so
 * this keeps it all in one readable block rather than losing it.
 */
export function buildFinanceLeadMessage(input: FinanceLeadInput): string {
  const band = DOWN_PAYMENT_OPTIONS.find(
    (o) => o.value === input.downPaymentBand,
  );

  const parts = [
    "Finance page enquiry (pre-application).",
    input.vehicle ? `Vehicle interested in: ${input.vehicle}` : null,
    band ? `Approximate down payment: ${band.label}` : null,
    input.tradeIn ? `Trade-in: ${input.tradeIn}` : null,
    input.contactMethod ? `Prefers contact by: ${input.contactMethod}` : null,
    input.lookingFor ? `\nWhat they're looking for:\n${input.lookingFor}` : null,
  ].filter(Boolean);

  return parts.join("\n");
}
