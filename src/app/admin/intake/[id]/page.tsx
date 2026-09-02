import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canWrite, requireSection } from "@/lib/auth";
import { INTAKE_LABELS, INTAKE_STYLES } from "@/lib/intake";
import { createClient } from "@/lib/supabase/server";
import { vehicleTitle } from "@/lib/vehicles";

import { PhotoManager, type PhotoItem } from "../../inventory/[id]/PhotoManager";
import { saveIntake, submitIntake } from "../actions";
import { IntakeForm } from "./IntakeForm";
import { SubmitIntake } from "./SubmitIntake";

export const metadata: Metadata = { title: "Vehicle intake" };
export const dynamic = "force-dynamic";

export default async function IntakeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ decode?: string; found?: string }>;
}) {
  const profile = await requireSection("inventory");
  const { id } = await params;
  const { decode, found } = await searchParams;

  if (!canWrite(profile)) {
    redirect("/admin/inventory?error=forbidden");
  }

  const supabase = await createClient();

  const [{ data: vehicle }, { data: photoRows }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("vehicle_photos")
      .select("*")
      .eq("vehicle_id", id)
      .order("position"),
  ]);

  if (!vehicle) notFound();

  // Already through review — the phone flow has nothing left to do with it.
  if (vehicle.intake_status === "pending" || vehicle.intake_status === "approved") {
    redirect(`/admin/inventory/${vehicle.id}`);
  }

  const photos: PhotoItem[] = (photoRows ?? []).map((row) => ({
    id: row.id,
    isPrimary: row.is_primary,
    alt: row.alt_text ?? vehicleTitle(vehicle),
    url:
      row.remote_url ??
      supabase.storage.from("vehicle-photos").getPublicUrl(row.storage_path!)
        .data.publicUrl,
  }));

  const blocked: string[] = [];
  if (!vehicle.vin) blocked.push("a VIN");
  if (vehicle.mileage === null) blocked.push("the mileage");
  if (photos.length === 0) blocked.push("at least one photo");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/intake"
          className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
        >
          ← Intake
        </Link>
        {vehicle.intake_status ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${INTAKE_STYLES[vehicle.intake_status]}`}
          >
            {INTAKE_LABELS[vehicle.intake_status]}
          </span>
        ) : null}
      </div>

      <h1 className="mt-3 text-xl font-bold text-navy-900">
        {vehicleTitle(vehicle)}
      </h1>
      <p className="mt-1 font-mono text-xs tracking-wider text-navy-700/70">
        {vehicle.vin}
      </p>

      {found ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-keyblue-200 bg-keyblue-50 px-3 py-3 text-sm text-keyblue-900"
        >
          That VIN was already on file, so this opened the existing record
          rather than creating a second one.
        </p>
      ) : null}

      {vehicle.intake_status === "returned" && vehicle.intake_note ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">Sent back for changes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900/90">
            {vehicle.intake_note}
          </p>
        </div>
      ) : null}

      <section className="mt-6">
        <h2 className="text-sm font-bold text-navy-900">Photos</h2>
        <p className="mt-1 text-xs text-navy-700">
          Front three-quarter, back, both sides, dash with the odometer, and
          anything wrong with it.
        </p>
        <div className="mt-3">
          <PhotoManager vehicleId={vehicle.id} photos={photos} canEdit />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-navy-900">Details</h2>
        <div className="mt-3">
          <IntakeForm
            vehicle={vehicle}
            action={saveIntake.bind(null, vehicle.id)}
            decodeFailed={decode === "failed"}
          />
        </div>
      </section>

      <section className="mt-8 border-t border-slate-200 pt-6">
        <SubmitIntake
          action={submitIntake.bind(null, vehicle.id)}
          blocked={blocked}
        />
      </section>
    </div>
  );
}
