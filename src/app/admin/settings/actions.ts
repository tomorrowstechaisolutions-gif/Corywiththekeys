"use server";

import { revalidatePath } from "next/cache";

import { requireSection } from "@/lib/auth";
import { BRAND_SLOTS, type BrandSlot } from "@/lib/brand";
import { MEDIA_BUCKET } from "@/lib/buckets";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  BrandPathSchema,
  BrandTextSchema,
  BusinessSchema,
  HoursSchema,
  NotificationsSchema,
  SocialsSchema,
  SwitchesSchema,
} from "@/lib/validation/settings";

export type SettingsState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Every one of these values is printed on the public site, so a change is
 * only worth making if visitors see it. Next caches the rendered pages, and
 * the footer lives in the root layout, so the whole tree has to be dropped
 * rather than a single route.
 */
function revalidateEverything() {
  revalidatePath("/", "layout");
}

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/**
 * Settings is an admin-only section, and `requireSection` redirects anyone
 * else before this runs. The check is repeated in RLS, so a forged request
 * still cannot write — this guard is for the redirect, not the safety.
 */
async function guard() {
  const profile = await requireSection("settings");
  const supabase = await createClient();
  return { profile, supabase };
}

function failed(message: string): SettingsState {
  return { error: message };
}

/**
 * Turn a database error from the brand columns into something actionable.
 *
 * These five columns arrive with migration 0026. Until it is applied Postgres
 * answers "column does not exist", and the generic "please try again" would
 * send somebody round in circles retrying a save that can never work. Saying
 * what is actually missing is the difference between a two-minute fix and an
 * afternoon.
 */
function brandFailure(message: string): SettingsState {
  if (/column .* does not exist/i.test(message)) {
    return failed(
      "The branding columns are not in the database yet. Migration 0026_brand_assets.sql needs to be run against Supabase before this can be saved.",
    );
  }
  return failed("Could not save that. Please try again.");
}

export async function saveBusiness(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile, supabase } = await guard();

  const parsed = BusinessSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({
      phone: input.phone,
      email: input.email,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2,
      city: input.city,
      state: input.state,
      postal_code: input.postalCode,
      updated_by: profile.id,
    })
    .eq("id", true);

  if (error) return failed("Could not save. Please try again.");

  revalidateEverything();
  return { ok: true, message: "Business details saved." };
}

export async function saveSocials(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile, supabase } = await guard();

  const parsed = SocialsSchema.safeParse({
    facebookUrl: formData.get("facebookUrl"),
    instagramUrl: formData.get("instagramUrl"),
    tiktokUrl: formData.get("tiktokUrl"),
    snapchatUrl: formData.get("snapchatUrl"),
    youtubeUrl: formData.get("youtubeUrl"),
    linktreeUrl: formData.get("linktreeUrl"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({
      facebook_url: input.facebookUrl,
      instagram_url: input.instagramUrl,
      tiktok_url: input.tiktokUrl,
      snapchat_url: input.snapchatUrl,
      youtube_url: input.youtubeUrl,
      linktree_url: input.linktreeUrl,
      updated_by: profile.id,
    })
    .eq("id", true);

  if (error) return failed("Could not save those links. Please try again.");

  revalidateEverything();
  return {
    ok: true,
    message:
      "Social links saved. Clear a box to take that icon off the site entirely.",
  };
}

export async function saveSwitches(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile, supabase } = await guard();

  const parsed = SwitchesSchema.safeParse({
    shopCheckoutEnabled: formData.get("shopCheckoutEnabled"),
    showInventoryPrices: formData.get("showInventoryPrices"),
    announcementEnabled: formData.get("announcementEnabled"),
    announcementText: formData.get("announcementText"),
    announcementHref: formData.get("announcementHref"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({
      // Forced off, deliberately, and not because the form said so.
      //
      // There is no /shop/checkout route and no payment processor behind one.
      // Switching this on would put a Checkout button in the cart that leads
      // to a 404, which loses the sale outright — strictly worse than the
      // "text Cory to order" flow it would replace. The form shows the switch
      // disabled with that explanation; this line is what makes it true even
      // if the request is crafted by hand.
      //
      // When checkout is built: delete this line, use input.shopCheckoutEnabled,
      // and enable the switch in SwitchesForm.
      shop_checkout_enabled: false,
      show_inventory_prices: input.showInventoryPrices,
      announcement_enabled: input.announcementEnabled,
      announcement_text: input.announcementText,
      announcement_href: input.announcementHref,
      updated_by: profile.id,
    })
    .eq("id", true);

  if (error) return failed("Could not save those switches. Please try again.");

  revalidateEverything();
  return { ok: true, message: "Site switches saved." };
}

export async function saveNotifications(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile, supabase } = await guard();

  const parsed = NotificationsSchema.safeParse({
    leadsEmail: formData.get("leadsEmail"),
    messagesEmail: formData.get("messagesEmail"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const { error } = await supabase
    .from("notification_settings")
    .update({
      leads_email: input.leadsEmail,
      messages_email: input.messagesEmail,
      updated_by: profile.id,
    })
    .eq("id", true);

  if (error) return failed("Could not save those addresses. Please try again.");

  revalidatePath("/admin/settings");
  return {
    ok: true,
    message:
      "Saved. Nothing sends mail yet, so these are stored ready for when it does.",
  };
}

export async function saveHours(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { supabase } = await guard();

  const days = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    dayOfWeek: day,
    isClosed: formData.get(`closed-${day}`),
    opens: formData.get(`opens-${day}`),
    closes: formData.get(`closes-${day}`),
  }));

  const parsed = HoursSchema.safeParse({ days });

  if (!parsed.success) {
    // Turn "days.3.closes" into "closes-3", which is what the inputs are
    // named, so the message lands on the row it belongs to.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const [, index, field] = issue.path.map(String);
      const key = field && index ? `${field}-${index}` : "form";
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  // Seven small updates rather than one upsert: INSERT is not granted on this
  // table to anybody, which is what keeps it at exactly seven rows.
  for (const day of parsed.data.days) {
    const { error } = await supabase
      .from("business_hours")
      .update({
        is_closed: day.isClosed,
        opens: day.isClosed ? null : day.opens,
        closes: day.isClosed ? null : day.closes,
      })
      .eq("day_of_week", day.dayOfWeek);

    if (error) return failed("Could not save the hours. Please try again.");
  }

  revalidateEverything();
  return { ok: true, message: "Opening hours saved." };
}

/* ── brand ─────────────────────────────────────────────────────────────── */

type SettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

/**
 * The one-column update for a slot, written out rather than computed.
 *
 * `{ [column]: value }` type-checks as an index signature, which makes the
 * whole update object `never` and throws away every guarantee the generated
 * types give us. A switch costs three lines and keeps them.
 */
function brandImageUpdate(slot: BrandSlot, value: string | null): SettingsUpdate {
  switch (slot) {
    case "login_logo":
      return { login_logo_path: value };
    case "admin_mark":
      return { admin_mark_path: value };
    case "favicon":
      return { favicon_path: value };
  }
}

/** What is stored for a slot right now, so the old file can be cleaned up. */
async function currentBrandPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slot: BrandSlot,
): Promise<string | null> {
  const { data } = await supabase
    .from("site_settings")
    .select("login_logo_path, admin_mark_path, favicon_path")
    .eq("id", true)
    .maybeSingle();

  if (!data) return null;

  switch (slot) {
    case "login_logo":
      return data.login_logo_path ?? null;
    case "admin_mark":
      return data.admin_mark_path ?? null;
    case "favicon":
      return data.favicon_path ?? null;
  }
}

/**
 * The two lines of type under the sign-in mark.
 *
 * Saving blank clears the column, which means "fall back to the name in the
 * code" — see getSettings(). Clearing is therefore a real, useful action, not
 * a mistake to be prevented.
 */
export async function saveBrandText(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile, supabase } = await guard();

  const parsed = BrandTextSchema.safeParse({
    brandWordmark: formData.get("brandWordmark"),
    brandTagline: formData.get("brandTagline"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      brand_wordmark: parsed.data.brandWordmark,
      brand_tagline: parsed.data.brandTagline,
      updated_by: profile.id,
    })
    .eq("id", true);

  if (error) return brandFailure(error.message);

  revalidateEverything();
  return { ok: true, message: "Sign-in wording saved." };
}

/**
 * Record a mark the browser has already uploaded to Storage.
 *
 * Same shape as the staff avatar flow: the file goes browser → Storage on the
 * signed-in user's own session, so Storage's policies decide whether it is
 * allowed, and this action is then told where it landed. Being told is not
 * being trusted — the path is validated, and the object is confirmed to exist
 * before anything is written, so a crafted request cannot point the site's
 * logo at a file that was never uploaded.
 */
export async function setBrandImage(
  slot: BrandSlot,
  path: string,
): Promise<{ ok?: true; error?: string }> {
  const { profile, supabase } = await guard();

  if (!BRAND_SLOTS.includes(slot)) {
    return { error: "That is not something you can change here." };
  }

  const parsedPath = BrandPathSchema.safeParse(path);
  if (!parsedPath.success) {
    return { error: parsedPath.error.issues[0]?.message ?? "That upload did not arrive." };
  }

  const stored = parsedPath.data;

  // Confirm the object is really there. `list` takes the folder and matches
  // on name, so the path is split rather than passed whole.
  const lastSlash = stored.lastIndexOf("/");
  const folder = lastSlash === -1 ? "" : stored.slice(0, lastSlash);
  const filename = stored.slice(lastSlash + 1);

  const { data: objects } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(folder, { search: filename });

  if (!objects?.some((object) => object.name === filename)) {
    return { error: "That upload did not arrive. Please try again." };
  }

  const previous = await currentBrandPath(supabase, slot);

  const { error } = await supabase
    .from("site_settings")
    .update({ ...brandImageUpdate(slot, stored), updated_by: profile.id })
    .eq("id", true);

  if (error) {
    // The row was not updated, so nothing points at the new file. Take it
    // back out rather than leaving an orphan in the bucket.
    await supabase.storage.from(MEDIA_BUCKET).remove([stored]);
    return { error: brandFailure(error.message).error };
  }

  // Only once the new one is saved, and never the compiled-in default, which
  // is a file in the repo rather than an object in the bucket.
  if (previous && previous !== stored) {
    await supabase.storage.from(MEDIA_BUCKET).remove([previous]);
  }

  revalidateEverything();
  return { ok: true };
}

/** Put a slot back to the mark compiled into the code. */
export async function clearBrandImage(
  slot: BrandSlot,
): Promise<{ ok?: true; error?: string }> {
  const { profile, supabase } = await guard();

  if (!BRAND_SLOTS.includes(slot)) {
    return { error: "That is not something you can change here." };
  }

  const previous = await currentBrandPath(supabase, slot);

  const { error } = await supabase
    .from("site_settings")
    .update({ ...brandImageUpdate(slot, null), updated_by: profile.id })
    .eq("id", true);

  if (error) return { error: brandFailure(error.message).error };

  if (previous) {
    await supabase.storage.from(MEDIA_BUCKET).remove([previous]);
  }

  revalidateEverything();
  return { ok: true };
}
