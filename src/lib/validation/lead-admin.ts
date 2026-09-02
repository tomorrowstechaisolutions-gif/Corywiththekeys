import { z } from "zod";

import { LEAD_STATUSES, MANUAL_LEAD_SOURCES } from "@/lib/leads";

const trimToNull = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

export const LeadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES as unknown as [string, ...string[]]),
});

export const LeadAssignSchema = z.object({
  id: z.string().uuid(),
  // Empty string is the "Nobody" option, which is a real choice.
  assignedTo: z.preprocess(trimToNull, z.string().uuid().nullable()),
});

export const LeadFollowUpSchema = z.object({
  id: z.string().uuid(),
  followUpAt: z.preprocess(
    trimToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
      .nullable(),
  ),
});

export const LeadNoteSchema = z.object({
  id: z.string().uuid(),
  body: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(1, "Write something first.")
      .max(4000, "That note is too long."),
  ),
});

/**
 * Logging a call or text that happened outside the system.
 *
 * `outcome` is free text rather than a fixed list on purpose — this is a
 * starter CRM, and forcing somebody to pick from six canned outcomes at the
 * moment they put the phone down is how call logging stops happening.
 */
export const LogContactSchema = z.object({
  id: z.string().uuid(),
  channel: z.enum(["phone", "sms", "email", "in_person"]),
  body: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().max(4000, "That note is too long.").optional().default(""),
  ),
  followUpAt: z.preprocess(
    trimToNull,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  ),
});

export const CONTACT_CHANNEL_LABELS = {
  phone: "Called",
  sms: "Texted",
  email: "Emailed",
  in_person: "Spoke in person",
} as const;

/** Adding a walk-in or a phone enquiry by hand. */
export const ManualLeadSchema = z.object({
  firstName: z.preprocess(trimToNull, z.string().max(80).nullable()),
  lastName: z.preprocess(trimToNull, z.string().max(80).nullable()),
  phone: z.preprocess(trimToNull, z.string().max(40).nullable()),
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null),
    z.string().email("That does not look like an email address.").nullable(),
  ),
  source: z.enum(MANUAL_LEAD_SOURCES as unknown as [string, ...string[]]),
  message: z.preprocess(trimToNull, z.string().max(4000).nullable()),
  assignedTo: z.preprocess(trimToNull, z.string().uuid().nullable()),
  followUpAt: z.preprocess(
    trimToNull,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  ),
})
  // A lead nobody can contact is not a lead. This is the one hard rule on
  // the manual form; everything else can be filled in later.
  .refine((data) => Boolean(data.phone || data.email), {
    path: ["phone"],
    message: "Add a phone number or an email — otherwise nobody can call them back.",
  });

export type ManualLeadInput = z.infer<typeof ManualLeadSchema>;
