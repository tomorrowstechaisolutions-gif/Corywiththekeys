"use server";

import { revalidatePath } from "next/cache";

import { requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
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
