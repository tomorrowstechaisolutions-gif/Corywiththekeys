"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildVehicleSlug } from "@/lib/vehicles";
import { VehicleSchema, type VehicleInput } from "@/lib/validation/vehicle";
import type { Database } from "@/types/database";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];

/**
 * Every write below runs on the SIGNED-IN USER'S session, not the service
 * role. Two reasons, both deliberate:
 *
 *   - RLS still applies, so a `viewer` cannot write even if a bug let them
 *     reach this code.
 *   - audit_log records auth.uid() as the actor. Under the service role that
 *     is null and the audit trail cannot tell you who changed a price.
 */
async function guard() {
  const profile = await requireStaff();

  if (!canWrite(profile)) {
    return { profile, denied: "Your role cannot change inventory." as const };
  }

  return { profile, denied: null };
}

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

function parseVehicleForm(formData: FormData) {
  return VehicleSchema.safeParse({
    year: formData.get("year"),
    make: formData.get("make"),
    model: formData.get("model"),
    trim: formData.get("trim"),
    vin: formData.get("vin"),
    stock_number: formData.get("stock_number"),
    body_type: formData.get("body_type"),
    mileage: formData.get("mileage"),
    exterior_color: formData.get("exterior_color"),
    interior_color: formData.get("interior_color"),
    transmission: formData.get("transmission"),
    drivetrain: formData.get("drivetrain"),
    fuel_type: formData.get("fuel_type"),
    engine: formData.get("engine"),
    price: formData.get("price"),
    monthly_payment: formData.get("monthly_payment"),
    down_payment: formData.get("down_payment"),
    description: formData.get("description"),
    features: formData.get("features"),
    status: formData.get("status"),
    is_featured: formData.get("is_featured"),
    source: formData.get("source"),
    partner_lot_id: formData.get("partner_lot_id"),
  });
}

/** Turn a Postgres error into something a person can act on. */
function friendlyDbError(message: string): string {
  if (message.includes("vehicles_slug_key")) {
    return "A vehicle with that name already exists. Change the trim to tell them apart.";
  }
  if (message.includes("vehicles_partner_requires_lot")) {
    return "A partner vehicle needs a partner lot.";
  }
  if (message.includes("vehicles_year_check")) {
    return "That year is outside the allowed range.";
  }
  return "Could not save this vehicle. Please try again.";
}

export async function createVehicle(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input: VehicleInput = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("vehicles").select("slug");
  const taken = new Set((existing ?? []).map((row) => row.slug));

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      ...input,
      slug: buildVehicleSlug(input, taken),
      ingestion_method: "manual",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: friendlyDbError(error?.message ?? "") };
  }

  revalidatePath("/admin/inventory");
  redirect(`/admin/inventory/${data.id}?created=1`);
}

export async function updateVehicle(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { error: friendlyDbError(error.message) };
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
  return { ok: true };
}

/** Quick status change from the list view. */
export async function setVehicleStatus(id: string, status: VehicleStatus) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  await supabase
    .from("vehicles")
    .update({
      status,
      sold_at: status === "sold" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
}

export async function toggleFeatured(id: string, next: boolean) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();
  await supabase.from("vehicles").update({ is_featured: next }).eq("id", id);

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
}

/**
 * Hand columns back to the partner feed.
 *
 * Editing a feed-sourced vehicle locks the columns you touched so the next
 * sync cannot undo your work. This is the deliberate act of releasing one.
 */
export async function unlockVehicleFields(id: string, fields: string[]) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();
  await supabase.rpc("unlock_vehicle_fields", {
    p_vehicle_id: id,
    p_fields: fields,
  });

  revalidatePath(`/admin/inventory/${id}`);
}

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export async function uploadVehiclePhotos(
  vehicleId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { error: "Choose at least one image." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("id, position, is_primary")
    .eq("vehicle_id", vehicleId)
    .order("position", { ascending: false });

  let position = existing?.[0]?.position ?? -1;
  let hasPrimary = (existing ?? []).some((p) => p.is_primary);

  for (const file of files) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { error: `${file.name} is not a JPEG, PNG, WebP or AVIF image.` };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: `${file.name} is larger than 10 MB.` };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${vehicleId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-photos")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: `Could not upload ${file.name}. ${uploadError.message}` };
    }

    position += 1;

    const { error: rowError } = await supabase.from("vehicle_photos").insert({
      vehicle_id: vehicleId,
      storage_path: path,
      position,
      is_primary: !hasPrimary,
    });

    if (rowError) {
      // Do not leave an orphaned file in the bucket.
      await supabase.storage.from("vehicle-photos").remove([path]);
      return { error: `Could not save ${file.name}. Please try again.` };
    }

    hasPrimary = true;
  }

  revalidatePath(`/admin/inventory/${vehicleId}`);
  return { ok: true };
}

export async function deleteVehiclePhoto(photoId: string, vehicleId: string) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("vehicle_photos")
    .select("storage_path, is_primary")
    .eq("id", photoId)
    .single();

  await supabase.from("vehicle_photos").delete().eq("id", photoId);

  if (photo?.storage_path) {
    await supabase.storage.from("vehicle-photos").remove([photo.storage_path]);
  }

  // A vehicle should not be left without a lead image.
  if (photo?.is_primary) {
    const { data: next } = await supabase
      .from("vehicle_photos")
      .select("id")
      .eq("vehicle_id", vehicleId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase
        .from("vehicle_photos")
        .update({ is_primary: true })
        .eq("id", next.id);
    }
  }

  revalidatePath(`/admin/inventory/${vehicleId}`);
}

export async function setPrimaryPhoto(photoId: string, vehicleId: string) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  // A partial unique index allows only one primary per vehicle, so the old
  // one has to be cleared before the new one is set.
  await supabase
    .from("vehicle_photos")
    .update({ is_primary: false })
    .eq("vehicle_id", vehicleId)
    .eq("is_primary", true);

  await supabase
    .from("vehicle_photos")
    .update({ is_primary: true })
    .eq("id", photoId);

  revalidatePath(`/admin/inventory/${vehicleId}`);
}
