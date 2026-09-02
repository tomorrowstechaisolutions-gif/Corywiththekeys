import { z } from "zod";

import { ADMIN_SECTIONS } from "@/lib/admin-nav";

export const USER_ROLES = ["admin", "sales", "viewer"] as const;

export const ROLE_DESCRIPTIONS: Record<(typeof USER_ROLES)[number], string> = {
  admin:
    "Full control, including inviting staff and changing what everyone can reach.",
  sales: "Can add and edit records — vehicles, products, leads, customers.",
  viewer: "Can look at everything they are given, but cannot change anything.",
};

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

/** Inviting someone: an address, and what they arrive as. */
export const InviteSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("That does not look like an email address.").max(160),
  ),
  fullName: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(120).nullable(),
  ),
  title: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(120).nullable(),
  ),
  role: z.enum(USER_ROLES),
});

export type InviteInput = z.infer<typeof InviteSchema>;

/**
 * Editing someone.
 *
 * `restrict` is the toggle between "everything their role allows" and "only
 * these sections". It is separate from the list so that unticking every box
 * means no sections — an intelligible thing to do — rather than silently
 * meaning no restriction.
 */
export const MemberSchema = z
  .object({
    id: z.string().uuid(),
    fullName: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z.string().max(120).nullable(),
    ),
    title: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z.string().max(120).nullable(),
    ),
    phone: z.preprocess(
      (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
      z.string().max(40).nullable(),
    ),
    role: z.enum(USER_ROLES),
    isActive: z.preprocess((v) => v === "on" || v === true, z.boolean()),
    restrict: z.preprocess((v) => v === "on" || v === true, z.boolean()),
    sections: z.preprocess(
      (v) => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]),
      z.array(z.enum(ADMIN_SECTIONS)).max(ADMIN_SECTIONS.length),
    ),
  })
  .transform((data) => ({
    ...data,
    // Admins are never section-restricted — the database trigger enforces the
    // same thing, this just keeps the form honest about it.
    sections: data.role === "admin" || !data.restrict ? null : data.sections,
  }));

export type MemberInput = z.infer<typeof MemberSchema>;
