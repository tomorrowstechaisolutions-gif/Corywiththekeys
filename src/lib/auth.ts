import { redirect } from "next/navigation";

import { navFor, sectionsForRole, type AdminSection } from "@/lib/admin-nav";
import { FULL_ACCESS_ROLES, WRITE_ROLES, type UserRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Re-exported so the many existing importers keep working; the definitions
// live in lib/roles so client components can reach them too.
export {
  FULL_ACCESS_ROLES,
  ROLE_LABELS,
  WRITE_ROLES,
  type UserRole,
} from "@/lib/roles";

export function canWrite(profile: Profile): boolean {
  return WRITE_ROLES.includes(profile.role);
}

/** Owner or admin: everything is open to both. Mirrors public.is_admin(). */
export function isAdmin(profile: Profile): boolean {
  return FULL_ACCESS_ROLES.includes(profile.role);
}

/**
 * The owner's seat, which only the owner may hand to anybody else.
 *
 * Kept separate from isAdmin because the two answer different questions:
 * isAdmin is "can they open this", isOwner is "can they change who is in
 * charge". Enforced in the database too — see protect_owner_seat().
 */
export function isOwner(profile: Pick<Profile, "role">): boolean {
  return profile.role === "owner";
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

/**
 * May this person open this section?
 *
 * Two gates, and the role gate is always first: a per-person tick box can
 * never hand someone a section their role does not allow. `sections` of NULL
 * means no per-person restriction at all, which is what everyone starts with.
 */
export function canAccessSection(
  profile: Pick<Profile, "role" | "sections">,
  section: AdminSection,
): boolean {
  const allowedByRole = sectionsForRole(profile.role).some(
    (item) => item.key === section,
  );
  if (!allowedByRole) return false;
  if (profile.sections === null) return true;
  return profile.sections.includes(section);
}

/**
 * Where to send someone who cannot open where they asked for.
 *
 * Their first permitted section, not a hard-coded /admin/dashboard — an
 * employee given Inventory only has no dashboard to be bounced to, and
 * redirecting them there would loop.
 */
export function landingHref(
  profile: Pick<Profile, "role" | "sections">,
): string | null {
  return navFor(profile)[0]?.href ?? null;
}

/**
 * Guard for an admin page.
 *
 * Hiding a nav link is decoration — this is what stops someone typing the URL.
 * Every page under /admin calls it, so a restricted employee is redirected on
 * the server rather than merely not seeing the link.
 *
 * Note what this is NOT: the database still trusts the ROLE. A sales user
 * restricted to Inventory cannot open /admin/leads, but their token would
 * still satisfy the RLS policy on the leads table. That is the agreed level
 * for a small team; tightening it means reworking policies table by table.
 */
export async function requireSection(section: AdminSection): Promise<Profile> {
  const profile = await requireStaff();

  if (!canAccessSection(profile, section)) {
    const home = landingHref(profile);
    // Someone with no sections at all has nowhere inside to go. Sending them
    // back to /admin would bounce forever, so they leave with an explanation.
    redirect(home ? `${home}?error=forbidden` : "/login?error=no_access");
  }

  return profile;
}

/** Best display name available for a profile. */
export function displayName(profile: Profile): string {
  return profile.full_name?.trim() || profile.email;
}
