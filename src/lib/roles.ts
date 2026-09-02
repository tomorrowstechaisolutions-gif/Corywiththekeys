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
  owner: "Owner",
  admin: "Admin",
  sales: "Sales",
  viewer: "Viewer",
};

/** Roles allowed to change operational data. Mirrors public.can_write(). */
export const WRITE_ROLES: readonly UserRole[] = ["owner", "admin", "sales"];

/**
 * Roles that reach every section. Mirrors public.is_admin().
 *
 * Owner and Admin have identical reach on purpose. The difference is not what
 * they can open, it is that an admin cannot demote the owner or switch him
 * off — so the person who owns the business cannot be locked out of it.
 */
export const FULL_ACCESS_ROLES: readonly UserRole[] = ["owner", "admin"];
