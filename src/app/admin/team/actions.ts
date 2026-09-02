"use server";

import { revalidatePath } from "next/cache";

import { isAdmin, isOwner, requireSection } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  InviteSchema,
  MemberSchema,
} from "@/lib/validation/team";

export type TeamState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * Is there an owner yet?
 *
 * Until there is, an admin may appoint the first one — otherwise the role
 * could never be used at all, since only an owner can appoint an owner. The
 * database applies the same one-time exception; see 0021.
 */
async function ownerExists(): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  return (count ?? 0) > 0;
}

/** Every action here is admin-only, checked server-side on every call. */
async function guard() {
  const profile = await requireSection("team");
  if (!isAdmin(profile)) {
    return { profile, denied: "Only an admin can manage the team." as const };
  }
  return { profile, denied: null };
}

/**
 * Invite someone by email.
 *
 * Supabase sends them a link and they choose their own password — it never
 * passes through this app, and nobody here ever knows it. The account arrives
 * inactive with the role the inviter picked, so an unanswered invite grants
 * nothing.
 */
export async function inviteMember(
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  if (!serverEnv.hasServiceRole) {
    return {
      error:
        "Invites need the SUPABASE_SERVICE_ROLE_KEY environment variable, which is not set. Add it in Vercel and try again.",
    };
  }

  const input = parsed.data;

  /*
   * Only an owner appoints an owner.
   *
   * This check matters more here than anywhere else: the invite runs on the
   * service-role key, which bypasses RLS and is waved through by the database
   * trigger precisely because there is no signed-in user at that point. So
   * for this one path, the guard in front of it is the guard.
   */
  if (input.role === "owner" && !isOwner(profile) && (await ownerExists())) {
    return {
      error:
        "Only the owner can invite somebody as an owner. Invite them as an admin instead.",
    };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: { full_name: input.fullName },
  });

  if (error || !data?.user) {
    const already = /already|registered|exists/i.test(error?.message ?? "");
    return {
      error: already
        ? "Somebody with that email already has an account. Find them in the list below instead."
        : "Could not send that invite. Check the address and try again.",
    };
  }

  // handle_new_user() has just created the profile as an inactive viewer.
  // Set what the inviter actually chose.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      title: input.title,
      role: input.role,
    })
    .eq("id", data.user.id);

  if (profileError) {
    return {
      error:
        "The invite went out, but their role did not save. Set it from the list below.",
    };
  }

  revalidatePath("/admin/team");
  return {
    ok: true,
    message: `Invite sent to ${input.email}. They stay switched off until you activate them.`,
  };
}

/** Update one person's role, sections, details and active state. */
export async function updateMember(
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = MemberSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    isActive: formData.get("isActive"),
    restrict: formData.get("restrict"),
    sections: formData.getAll("sections"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  /*
   * The owner's seat.
   *
   * The database refuses this too — see protect_owner_seat() — but a refusal
   * that arrives as a Postgres error code reads as a bug. Catching it here
   * means an admin gets a sentence explaining why instead.
   */
  if (!isOwner(profile)) {
    const { data: target } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", input.id)
      .maybeSingle();

    if (target?.role === "owner" && (input.role !== "owner" || !input.isActive)) {
      return {
        error:
          "Only the owner can change or switch off the owner. You can still edit their name, title and phone.",
      };
    }

    if (
      input.role === "owner" &&
      target?.role !== "owner" &&
      (await ownerExists())
    ) {
      return { error: "Only the owner can make somebody else an owner." };
    }
  }

  /*
   * Two locks on the last way in.
   *
   * An admin who demotes or deactivates themselves while they are the only
   * admin leaves the business with no one who can let anybody back in — and
   * no screen that can undo it. Both are refused here rather than explained
   * afterwards.
   */
  const keepsFullAccess = input.role === "owner" || input.role === "admin";

  if (input.id === profile.id && (!keepsFullAccess || !input.isActive)) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["owner", "admin"])
      .eq("is_active", true);

    if ((count ?? 0) <= 1) {
      return {
        error:
          "You are the only active admin. Promote somebody else to admin or owner first, otherwise nobody can get back in.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      title: input.title,
      phone: input.phone,
      role: input.role,
      is_active: input.isActive,
      sections: input.sections,
    })
    .eq("id", input.id);

  if (error) {
    console.error("[team] update failed", error.code, error.message);
    return { error: "Could not save that. Please try again." };
  }

  revalidatePath("/admin/team");
  return { ok: true, message: "Saved." };
}

/** Resend the invite / send a password reset. Their choice of password, not ours. */
export async function resendInvite(email: string): Promise<void> {
  const { denied } = await guard();
  if (denied) return;

  if (!serverEnv.hasServiceRole) return;

  const admin = createAdminClient();
  await admin.auth.admin.inviteUserByEmail(email);

  revalidatePath("/admin/team");
}
