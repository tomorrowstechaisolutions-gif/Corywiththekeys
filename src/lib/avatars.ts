import "server-only";

import { AVATAR_BUCKET } from "@/lib/buckets";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth";

/** An hour. Long enough to browse the console, short enough to be worth it. */
const SIGNED_URL_TTL = 60 * 60;

/**
 * Signed URLs for staff photos.
 *
 * The bucket is private, so there is no permanent public URL to build — every
 * view is a short-lived link. That is the price of not putting employees'
 * faces on guessable addresses, and it is worth paying for an internal tool.
 *
 * One call for the whole page rather than one per person: the team list would
 * otherwise fire a request per row.
 *
 * A failure here is never fatal. Photos are decoration; an unsigned avatar
 * falls back to initials and nobody is blocked from their work.
 */
export async function avatarUrls(
  profiles: Pick<Profile, "id" | "avatar_path">[],
): Promise<Map<string, string>> {
  const withPhotos = profiles.filter(
    (p): p is Pick<Profile, "id" | "avatar_path"> & { avatar_path: string } =>
      Boolean(p.avatar_path),
  );

  const urls = new Map<string, string>();
  if (withPhotos.length === 0) return urls;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrls(
        withPhotos.map((p) => p.avatar_path),
        SIGNED_URL_TTL,
      );

    if (error || !data) {
      console.error("[avatars] could not sign", error?.message);
      return urls;
    }

    // The API returns results in the order asked for, each carrying its own
    // error when that particular object is missing.
    data.forEach((entry, index) => {
      const profile = withPhotos[index];
      if (entry.signedUrl && !entry.error) {
        urls.set(profile.id, entry.signedUrl);
      }
    });
  } catch (error) {
    console.error("[avatars] unavailable", error);
  }

  return urls;
}

/** One photo. Same rules as above. */
export async function avatarUrl(
  profile: Pick<Profile, "id" | "avatar_path">,
): Promise<string | null> {
  const urls = await avatarUrls([profile]);
  return urls.get(profile.id) ?? null;
}

/**
 * Initials for the fallback tile: "Cory Simek" → "CS", "cory@…" → "C".
 *
 * Deliberately at most two letters. Three-initial monograms read as a logo
 * rather than a person, and long names produce noise.
 */
export function initials(name: string): string {
  const words = name
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
