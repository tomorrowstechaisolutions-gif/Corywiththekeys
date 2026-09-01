"use server";

import { revalidatePath } from "next/cache";

import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { PartnerLotSchema } from "@/lib/validation/vehicle";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function guard() {
  const profile = await requireStaff();
  return canWrite(profile) ? null : "Your role cannot change partner lots.";
}

export async function createPartnerLot(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await guard();
  if (denied) return { error: denied };

  const parsed = PartnerLotSchema.safeParse({
    name: formData.get("name"),
    contact_name: formData.get("contact_name"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    address_line1: formData.get("address_line1"),
    city: formData.get("city"),
    state: formData.get("state"),
    postal_code: formData.get("postal_code"),
    commission_notes: formData.get("commission_notes"),
    display_on_site: formData.get("display_on_site"),
    is_active: formData.get("is_active"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase.from("partner_lots").select("slug");
  const taken = new Set((existing ?? []).map((row) => row.slug));

  const base = slugify(parsed.data.name) || "partner-lot";
  let slug = base;
  for (let n = 2; taken.has(slug) && n < 200; n += 1) slug = `${base}-${n}`;

  const { error } = await supabase
    .from("partner_lots")
    .insert({ ...parsed.data, slug });

  if (error) {
    return { error: "Could not save this partner lot. Please try again." };
  }

  revalidatePath("/admin/partner-lots");
  revalidatePath("/admin/inventory");
  return { ok: true };
}

export async function setPartnerLotActive(id: string, active: boolean) {
  const denied = await guard();
  if (denied) return;

  const supabase = await createClient();
  await supabase.from("partner_lots").update({ is_active: active }).eq("id", id);

  revalidatePath("/admin/partner-lots");
}
