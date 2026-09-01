import { z } from "zod";

/**
 * Sign-in input. Parsed on the server before anything touches Supabase —
 * the client-side copy of these rules is a convenience, never the gate.
 */
export const SignInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .max(254, "That email address is too long.")
    .email("That does not look like an email address."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(200, "That password is too long."),
  next: z
    .string()
    .optional()
    // Only same-origin admin paths. Blocks `?next=https://evil.example`
    // being used to bounce a signed-in user off-site after login.
    .transform((value) =>
      value && /^\/admin(\/|$)/.test(value) ? value : "/admin/dashboard",
    ),
});

export type SignInInput = z.infer<typeof SignInSchema>;
