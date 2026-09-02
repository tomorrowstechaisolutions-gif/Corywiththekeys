"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth";
import { AVATAR_BUCKET } from "@/lib/buckets";
import { createClient } from "@/lib/supabase/server";
import { MyProfileSchema } from "@/lib/validation/team";

export type ProfileState = {
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
    out[String(issue.path[0] ?? "form")] ??= issue.message;
  }
  return out;
}

/**
 * Your own name, job title and phone number.
 *
 * Everyone signed in may do this — it is their own record. The three fields
 * that decide power (role, is_active, sections) are not in the schema and are
 * not in the update, and the RLS policy on profiles refuses a self-update
 * that changes role or clears is_active anyway. Three locks, none of which
 * relies on the form being the only way in.
 */
export async function updateMyProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const profile = await requireStaff();

  const parsed = MyProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      title: input.title,
      phone: input.phone,
    })
    .eq("id", profile.id);

  if (error) {
    console.error("[profile] update failed", error.code, error.message);
    return { error: "Could not save that. Please try again." };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved." };
}

/**
 * Record a photo the browser has already uploaded to Storage.
 *
 * Same shape as the vehicle and product galleries: the file goes straight
 * from the browser to Storage, because a Server Action caps its request body
 * at 1 MB and a phone photo is bigger than that. This only records the path,
 * and it checks two things before doing so — that the path sits inside this
 * person's own folder, and that an object really is there. Otherwise anyone
 * could point their avatar at somebody else's file.
 */
export async function setMyAvatar(path: string): Promise<ProfileState> {
  const profile = await requireStaff();

  const prefix = `${profile.id}/`;
  if (!path.startsWith(prefix) || path.includes("..")) {
    return { error: "That upload does not belong to your profile." };
  }

  const supabase = await createClient();

  const fileName = path.slice(prefix.length);
  const { data: objects } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(profile.id);

  if (!(objects ?? []).some((object) => object.name === fileName)) {
    return { error: "That upload did not arrive. Please try again." };
  }

  const previous = profile.avatar_path;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", profile.id);

  if (error) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    return { error: "Could not save that picture. Please try again." };
  }

  // Only now is the old file unreferenced. Removing it earlier would leave
  // the profile pointing at nothing if the update above failed.
  if (previous && previous !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([previous]);
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Picture updated." };
}

export async function removeMyAvatar(): Promise<ProfileState> {
  const profile = await requireStaff();

  if (!profile.avatar_path) return { ok: true, message: "No picture to remove." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", profile.id);

  if (error) return { error: "Could not remove that picture. Please try again." };

  await supabase.storage.from(AVATAR_BUCKET).remove([profile.avatar_path]);

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Picture removed." };
}
