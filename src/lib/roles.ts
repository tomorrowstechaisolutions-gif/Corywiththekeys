import type { Database } from "@/types/database";

/**
 * Role vocabulary, kept apart from `lib/auth`.
 *
 * `lib/auth` reaches for cookies and the Supabase server client, so importing
 * anything from it — even a label map — drags `next/headers` into whatever
 * bundle it lands in and breaks the build for client components. The names and
 * labels have no such dependency, so they live here and both sides import
 * them freely.
 */
export type UserRole = Database["public"]["Enums"]["user_role"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
  viewer: "Viewer",
};

/** Roles allowed to change operational data. Mirrors public.can_write(). */
export const WRITE_ROLES: readonly UserRole[] = ["admin", "sales"];
