import { z } from "zod";

/**
 * "Check availability" on a vehicle listing.
 *
 * Deliberately small. This is a question about one car, not an application —
 * name, how to reach them, and what they want to know. Nothing here is
 * sensitive, and nothing here needs to be: the financing conversation happens
 * behind the secure application on /finance, not in a box on a listing page.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const CONTACT_METHODS = ["phone", "text", "email"] as const;
export type InquiryContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_METHOD_LABELS: Record<InquiryContactMethod, string> = {
  phone: "Call me",
  text: "Text me",
  email: "Email me",
};

export const VehicleInquirySchema = z
  .object({
    name: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .min(2, "Tell us your name.")
        .max(120, "That name is too long."),
    ),
    phone: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z
        .string()
        .min(7, "That phone number looks too short.")
        .max(30)
        .nullable(),
    ),
    email: z.preprocess(
      (v) =>
        typeof v === "string"
          ? emptyToNull(v.trim().toLowerCase())
          : emptyToNull(v),
      z.string().email("Check that email address.").max(160).nullable(),
    ),
    message: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z.string().max(1500, "Keep it under 1500 characters.").nullable(),
    ),
    contactMethod: z.enum(CONTACT_METHODS),
    vehicleId: z.string().uuid(),
  })
  // Someone has to be reachable somehow, and which one is required depends on
  // how they asked to be contacted.
  .refine((data) => data.phone !== null || data.email !== null, {
    message: "Leave a phone number or an email so Cory can get back to you.",
    path: ["phone"],
  })
  .refine(
    (data) => data.contactMethod !== "email" || data.email !== null,
    { message: "Add an email address, or pick call or text instead.", path: ["email"] },
  )
  .refine(
    (data) => data.contactMethod === "email" || data.phone !== null,
    { message: "Add a phone number, or pick email instead.", path: ["phone"] },
  );

export type VehicleInquiryInput = z.infer<typeof VehicleInquirySchema>;

/** What lands in the lead's message field, so staff see the context. */
export function buildInquiryMessage(
  input: VehicleInquiryInput,
  vehicleTitle: string,
): string {
  const lines = [
    `Asking about: ${vehicleTitle}`,
    `Prefers: ${CONTACT_METHOD_LABELS[input.contactMethod]}`,
  ];
  if (input.message) lines.push("", input.message);
  return lines.join("\n");
}
