import { z } from "zod";

/**
 * The floating page assistant.
 *
 * Shorter than the contact form on purpose: someone who stops mid-browse to
 * ask a question will abandon a six-field form. Name, one way to reach them,
 * and the question. Everything else we can ask when we reply.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

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

export const AssistantSchema = z
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
    message: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .min(5, "Tell us a little more so we can help.")
        .max(4000, "That message is too long — keep it under 4000 characters."),
    ),
    /**
     * Where they were when they asked. Kept to a path so a spoofed value
     * cannot turn the subject line into a link to somebody else's site.
     */
    path: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z
        .string()
        .max(300)
        .regex(/^\/[^\s]*$/, "Unexpected page reference.")
        .nullable(),
    ),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Give us either an email or a phone number so we can reply.",
    path: ["email"],
  });

export type AssistantInput = z.infer<typeof AssistantSchema>;

/** Subject line for the inbox — the page is the most useful context we have. */
export function assistantSubject(input: AssistantInput): string {
  return input.path && input.path !== "/"
    ? `Asked from ${input.path}`
    : "Asked from the homepage";
}
