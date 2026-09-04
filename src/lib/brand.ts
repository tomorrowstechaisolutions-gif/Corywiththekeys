/**
 * The brand marks and wording, and where their files live.
 *
 * Its own file with no imports beyond plain constants, because both sides
 * need it: the sign-in screen and the root layout render these on the server,
 * and the uploader in Settings is a client component. Anything reaching for
 * the Supabase server client would break that upload form's build — the same
 * trap `lib/buckets` and `lib/roles` exist to avoid.
 */
import { MEDIA_BUCKET } from "@/lib/buckets";

/** The three images the business can replace. */
export const BRAND_SLOTS = ["login_logo", "admin_mark", "favicon"] as const;

export type BrandSlot = (typeof BRAND_SLOTS)[number];

/** Which column each slot writes to. Keeps the mapping in one place. */
export const BRAND_SLOT_COLUMNS: Record<BrandSlot, string> = {
  login_logo: "login_logo_path",
  admin_mark: "admin_mark_path",
  favicon: "favicon_path",
};

export const BRAND_SLOT_LABELS: Record<BrandSlot, string> = {
  login_logo: "Sign-in logo",
  admin_mark: "Admin console mark",
  favicon: "Browser tab icon",
};

/**
 * The mark compiled into the code, used until something is uploaded.
 *
 * The console rail and the tab icon have no image today — the rail is type
 * only, and the tab icon comes from `src/app/icon.png` through Next's own
 * file convention, which needs no URL here.
 */
export const BRAND_FALLBACKS: Record<BrandSlot, string | null> = {
  login_logo: "/brand/key-mark.png",
  admin_mark: null,
  favicon: null,
};

export const BRAND_MAX_BYTES = 2 * 1024 * 1024;

/**
 * No SVG, deliberately.
 *
 * An SVG is a document, not a picture: it can carry script, and this one
 * would be uploaded by a member of staff and then served from the site's own
 * origin to every visitor. The raster formats cannot do that.
 */
export const BRAND_MIME_TYPES = [
  "image/png",
  "image/webp",
  "image/avif",
  "image/jpeg",
] as const;

/**
 * A stored path turned into a URL the browser can fetch.
 *
 * Returns null rather than a broken URL when the path is missing or does not
 * look like a path — a stored value is only ever written by the upload flow,
 * but this is what renders it, so it re-checks rather than trusting.
 */
export function brandImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const trimmed = path.trim();
  if (trimmed === "") return null;
  if (trimmed.startsWith("/") || trimmed.includes("..")) return null;
  if (/^[a-zA-Z]+:/.test(trimmed)) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${trimmed}`;
}
