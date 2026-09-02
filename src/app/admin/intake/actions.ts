"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWrite, isAdmin, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildVehicleSlug } from "@/lib/vehicles";
import { checkVin, decodeVin } from "@/lib/vin";

export type IntakeState = {
  ok?: boolean;
  error?: string;
  notice?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Intake writes run on the SIGNED-IN USER'S session, like every other admin
 * write — RLS still applies and audit_log records who captured the car.
 */
async function guard() {
  const profile = await requireStaff();

  if (!canWrite(profile)) {
    return { profile, denied: "Your role cannot add vehicles." as const };
  }

  return { profile, denied: null };
}

/**
 * Step one: turn a scanned or typed VIN into a real draft vehicle.
 *
 * The record is created immediately rather than held in the phone's memory.
 * Somebody standing on a lot loses signal, locks the screen, or gets called
 * away — and if the record only existed in a React state object, all of that
 * loses the work. A row that exists from the first scan can be picked up
 * again from the same phone or a different one.
 */
export async function startIntake(
  _prev: IntakeState,
  formData: FormData,
): Promise<IntakeState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const checked = checkVin(String(formData.get("vin") ?? ""));
  if (!checked.ok) return { fieldErrors: { vin: checked.reason } };

  const { vin } = checked;
  const supabase = await createClient();

  // A VIN already on file is almost always the same car being scanned twice.
  // Send them to it rather than creating a duplicate to untangle later.
  const { data: duplicate } = await supabase
    .from("vehicles")
    .select("id, status")
    .eq("vin", vin)
    .not("status", "eq", "archived")
    .maybeSingle();

  if (duplicate) {
    redirect(`/admin/intake/${duplicate.id}?found=1`);
  }

  // Best effort. A lookup that is down or slow must not stop somebody adding
  // a car that is sitting in front of them — they fill the gaps by hand.
  const decoded = await decodeVin(vin);

  const { data: existing } = await supabase.from("vehicles").select("slug");
  const taken = new Set((existing ?? []).map((row) => row.slug));

  const year = decoded?.year ?? new Date().getFullYear();
  const make = decoded?.make ?? "Unknown";
  const model = decoded?.model ?? "Unknown";

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      vin,
      year,
      make,
      model,
      trim: decoded?.trim ?? null,
      body_type: decoded?.bodyType ?? null,
      engine: decoded?.engine ?? null,
      fuel_type: decoded?.fuelType ?? null,
      drivetrain: decoded?.drivetrain ?? null,
      transmission: decoded?.transmission ?? null,
      slug: buildVehicleSlug({ year, make, model, trim: decoded?.trim }, taken),
      status: "draft",
      ingestion_method: "mobile_intake",
      intake_status: "in_progress",
      intake_by: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[intake] could not start", error?.code, error?.message);
    return {
      error:
        "Could not start that intake. Check the VIN and try again, or add the vehicle from a desktop.",
    };
  }

  revalidatePath("/admin/inventory");
  redirect(`/admin/intake/${data.id}${decoded ? "" : "?decode=failed"}`);
}

function toNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").replace(/[$,\s]/g, "");
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Save the details captured on the phone. Called on its own and before submit. */
export async function saveIntake(
  id: string,
  _prev: IntakeState,
  formData: FormData,
): Promise<IntakeState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const fieldErrors: Record<string, string> = {};

  const year = toNumber(formData.get("year"));
  if (year !== null && (year < 1900 || year > 2100)) {
    fieldErrors.year = "That year does not look right.";
  }

  const mileage = toNumber(formData.get("mileage"));
  if (formData.get("mileage") && mileage === null) {
    fieldErrors.mileage = "Mileage must be a number.";
  }
  if (mileage !== null && (mileage < 0 || mileage > 2_000_000)) {
    fieldErrors.mileage = "That mileage does not look right.";
  }

  const price = toNumber(formData.get("price"));
  if (formData.get("price") && price === null) {
    fieldErrors.price = "Price must be a number.";
  }

  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  if (!make) fieldErrors.make = "Make is required.";
  if (!model) fieldErrors.model = "Model is required.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const text = (name: string) => {
    const value = String(formData.get(name) ?? "").trim();
    return value === "" ? null : value;
  };

  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      year: year ?? new Date().getFullYear(),
      make,
      model,
      trim: text("trim"),
      mileage,
      price,
      exterior_color: text("exterior_color"),
      interior_color: text("interior_color"),
      body_type: text("body_type"),
      engine: text("engine"),
      transmission: text("transmission"),
      drivetrain: text("drivetrain"),
      fuel_type: text("fuel_type"),
      stock_number: text("stock_number"),
      description: text("description"),
    })
    .eq("id", id);

  if (error) {
    console.error("[intake] save failed", error.code, error.message);
    return { error: "Could not save that. Check your signal and try again." };
  }

  revalidatePath(`/admin/intake/${id}`);
  return { ok: true, notice: "Saved." };
}

/**
 * Hand the capture over to a reviewer.
 *
 * The minimum is checked here rather than only in the browser, because the
 * browser check is a convenience and this one is the rule.
 */
export async function submitIntake(
  id: string,
  _prev: IntakeState,
  _formData: FormData,
): Promise<IntakeState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const supabase = await createClient();

  const [{ data: vehicle }, { count: photoCount }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("vin, mileage, make, model")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("vehicle_photos")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", id),
  ]);

  if (!vehicle) return { error: "That intake no longer exists." };

  const missing: string[] = [];
  if (!vehicle.vin) missing.push("a VIN");
  if (vehicle.mileage === null) missing.push("the mileage");
  if (!photoCount) missing.push("at least one photo");

  if (missing.length > 0) {
    return {
      error: `Still needs ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({
      intake_status: "pending",
      intake_at: new Date().toISOString(),
      intake_note: null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Could not send that for review. Please try again." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/intake/${id}`);
  redirect(`/admin/intake?submitted=1`);
}

/**
 * Approve a submission.
 *
 * Publishing without a price is the one thing this refuses. A live listing
 * with no price is worse than no listing — it reads as a mistake to the
 * customer and it cannot be shopped.
 */
export async function approveIntake(id: string) {
  const profile = await requireStaff();
  if (!isAdmin(profile)) return;

  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("price")
    .eq("id", id)
    .maybeSingle();

  if (!vehicle) return;

  await supabase
    .from("vehicles")
    .update({
      intake_status: "approved",
      intake_note: null,
      // No price means it is ready but not sellable yet: approve it, leave it
      // as a draft, and let whoever sets the price publish it.
      status: vehicle.price === null ? "draft" : "available",
    })
    .eq("id", id);

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
  redirect(
    vehicle.price === null
      ? `/admin/inventory/${id}?approved=nopriced`
      : `/admin/inventory/${id}?approved=1`,
  );
}

/** Send a submission back with a note saying what is wrong with it. */
export async function returnIntake(
  id: string,
  _prev: IntakeState,
  formData: FormData,
): Promise<IntakeState> {
  const profile = await requireStaff();
  if (!isAdmin(profile)) return { error: "Only an admin can review intakes." };

  const note = String(formData.get("note") ?? "").trim();

  if (note.length < 3) {
    return {
      fieldErrors: { note: "Say what needs fixing — they cannot guess." },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({
      intake_status: "returned",
      intake_note: note.slice(0, 2000),
      status: "draft",
    })
    .eq("id", id);

  if (error) return { error: "Could not send that back. Please try again." };

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
  return { ok: true, notice: "Sent back." };
}

/** Throw away an intake that was never finished. Draft records only. */
export async function discardIntake(id: string) {
  const profile = await requireStaff();
  if (!isAdmin(profile)) return;

  const supabase = await createClient();

  await supabase
    .from("vehicles")
    .delete()
    .eq("id", id)
    .eq("status", "draft")
    .in("intake_status", ["in_progress", "returned"]);

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?discarded=1");
}
