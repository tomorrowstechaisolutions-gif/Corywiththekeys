import { z } from "zod";

/**
 * Public contact form.
 *
 * Name, one way to reach them, a topic and a message. Nothing else — this
 * form exists to start a conversation, so it collects no employment, income,
 * date of birth or anything else a lender would want. A visitor who wants
 * financing is routed to /apply, which is built for it.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Digits only, then formatted to E.164. Optional here — email may be enough. */
const optionalUsPhone = z.preprocess(
  (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
  z
    .string()
    .nullable()
    .transform((value, ctx) => {
      if (value === null) return null;

      const digits = value.replace(/\D/g, "");
      const national =
        digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

      if (national.length !== 10) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a 10-digit US phone number, or leave it blank.",
        });
        return z.NEVER;
      }

      return `+1${national}`;
    }),
);

/**
 * The topics offered in the select. Keep in step with the cards in
 * `src/data/contact.ts` — both read from TOPICS there.
 */
export const CONTACT_TOPICS = [
  "Buy a car",
  "Merch & orders",
  "Music / media",
  "Partnerships",
  "Community",
  "General question",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const ContactSchema = z
  .object({
    fullName: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .min(2, "Please tell us your name.")
        .max(120, "That name is too long."),
    ),
    email: z.preprocess(
      (v) =>
        typeof v === "string"
          ? emptyToNull(v.trim().toLowerCase())
          : emptyToNull(v),
      z
        .string()
        .email("That does not look like an email address.")
        .max(254)
        .nullable(),
    ),
    phone: optionalUsPhone,
    topic: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z.enum(CONTACT_TOPICS).nullable(),
    ),
    message: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .min(10, "Tell us a little more so we can help.")
        .max(4000, "That message is too long — keep it under 4000 characters."),
    ),
  })
  // One way to reach them is the whole point of the form.
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Give us either an email or a phone number so we can reply.",
    path: ["email"],
  });

export type ContactInput = z.infer<typeof ContactSchema>;

/** Subject line for the message row, so the inbox is scannable. */
export function contactSubject(input: ContactInput): string {
  return input.topic ?? "General question";
}
