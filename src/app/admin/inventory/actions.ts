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

/**
 * Record photos the browser has ALREADY uploaded to Supabase Storage.
 *
 * The files do not pass through this server. Server Actions cap request
 * bodies at 1 MB, and buffering a 10 MB photo through Next.js on its way to
 * Storage is wasteful even when it fits. The browser uploads directly with
 * the signed-in user's session — storage RLS still requires can_write() — and
 * this action only writes the database rows.
 *
 * Because the client chooses the paths, every one is checked against the
 * vehicle's own prefix and confirmed to exist before a row is written.
 */
export async function registerVehiclePhotos(
  vehicleId: string,
  paths: string[],
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  if (paths.length === 0) return { error: "No photos to save." };

  // A client could send any path. Only this vehicle's folder is acceptable.
  const prefix = `${vehicleId}/`;
  if (paths.some((path) => !path.startsWith(prefix) || path.includes(".."))) {
    return { error: "Those photos do not belong to this vehicle." };
  }

  const supabase = await createClient();

  const { data: objects } = await supabase.storage
    .from("vehicle-photos")
    .list(vehicleId);

  const present = new Set((objects ?? []).map((o) => `${prefix}${o.name}`));
  const verified = paths.filter((path) => present.has(path));

  if (verified.length === 0) {
    return { error: "Those uploads did not arrive. Please try again." };
  }

  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("position, is_primary")
    .eq("vehicle_id", vehicleId)
    .order("position", { ascending: false });

  let position = existing?.[0]?.position ?? -1;
  let hasPrimary = (existing ?? []).some((p) => p.is_primary);

  const rows = verified.map((path) => {
    position += 1;
    const row = {
      vehicle_id: vehicleId,
      storage_path: path,
      position,
      is_primary: !hasPrimary,
    };
    hasPrimary = true;
    return row;
  });

  const { error } = await supabase.from("vehicle_photos").insert(rows);

  if (error) {
    // Do not leave orphaned files sitting in the bucket.
    await supabase.storage.from("vehicle-photos").remove(verified);
    return { error: "Could not save those photos. Please try again." };
  }

  revalidatePath(`/admin/inventory/${vehicleId}`);
  revalidatePath("/admin/inventory");
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

/**
 * Reorder a photo by swapping positions with its neighbour.
 *
 * Position drives the order on the public listing, so this is how the gallery
 * gets arranged. The lead image is separate — see setPrimaryPhoto.
 */
export async function moveVehiclePhoto(
  photoId: string,
  vehicleId: string,
  direction: "up" | "down",
) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("id, position")
    .eq("vehicle_id", vehicleId)
    .order("position", { ascending: true });

  if (!photos) return;

  const index = photos.findIndex((p) => p.id === photoId);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= photos.length) return;

  const current = photos[index];
  const other = photos[swapWith];

  await supabase
    .from("vehicle_photos")
    .update({ position: other.position })
    .eq("id", current.id);

  await supabase
    .from("vehicle_photos")
    .update({ position: current.position })
    .eq("id", other.id);

  revalidatePath(`/admin/inventory/${vehicleId}`);
}
