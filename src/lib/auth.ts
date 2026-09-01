import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
  viewer: "Viewer",
};

/** Roles allowed to change operational data. Mirrors public.can_write(). */
export const WRITE_ROLES: readonly UserRole[] = ["admin", "sales"];

export function canWrite(profile: Profile): boolean {
  return WRITE_ROLES.includes(profile.role);
}

export function isAdmin(profile: Profile): boolean {
  return profile.role === "admin";
}

/**
 * The signed-in staff profile, or null.
 *
 * Returns null for a signed-in user whose profile is inactive — a sign-up
 * that no admin has approved is not staff.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;

  return data;
}

/** Guard for any /admin page. Redirects instead of returning null. */
export async function requireStaff(): Promise<Profile> {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login?error=unauthorized");
  }

  return profile;
}

/** Guard for pages only some roles may open. */
export async function requireRole(
  ...roles: readonly UserRole[]
): Promise<Profile> {
  const profile = await requireStaff();

  if (!roles.includes(profile.role)) {
    redirect("/admin/dashboard?error=forbidden");
  }

  return profile;
}

/** Best display name available for a profile. */
export function displayName(profile: Profile): string {
  return profile.full_name?.trim() || profile.email;
}
