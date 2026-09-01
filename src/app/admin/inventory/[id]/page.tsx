import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  columnLabel,
  INGESTION_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  vehicleTitle,
} from "@/lib/vehicles";

import { unlockVehicleFields, updateVehicle } from "../actions";
import { VehicleForm } from "../VehicleForm";
import { PhotoManager, type PhotoItem } from "./PhotoManager";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const profile = await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;

  const supabase = await createClient();

  const [{ data: vehicle }, { data: partnerLots }, { data: photoRows }] =
    await Promise.all([
      supabase.from("vehicles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("partner_lots")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("vehicle_photos")
        .select("*")
        .eq("vehicle_id", id)
        .order("position"),
    ]);

  if (!vehicle) notFound();

  const editable = canWrite(profile);

  const photos: PhotoItem[] = (photoRows ?? []).map((row) => ({
    id: row.id,
    isPrimary: row.is_primary,
    alt: row.alt_text ?? vehicleTitle(vehicle),
    url:
      row.remote_url ??
      supabase.storage.from("vehicle-photos").getPublicUrl(row.storage_path!)
        .data.publicUrl,
  }));

  const isFeedManaged = vehicle.feed_id !== null;

  return (
    <Container className="py-8">
      <nav className="text-xs text-navy-700">
        <Link href="/admin/inventory" className="hover:text-keyblue-600">
          Inventory
        </Link>
        <span className="mx-1.5">/</span>
        <span>{vehicleTitle(vehicle)}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            {vehicleTitle(vehicle)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${STATUS_STYLES[vehicle.status]}`}
            >
              {STATUS_LABELS[vehicle.status]}
            </span>
            <span className="text-navy-700">
              {INGESTION_LABELS[vehicle.ingestion_method]}
            </span>
            <span className="text-navy-700/60">/{vehicle.slug}</span>
          </div>
        </div>

        {["available", "pending"].includes(vehicle.status) ? (
          <Link
            href={`/inventory/${vehicle.slug}`}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
          >
            View on site
          </Link>
        ) : null}
      </div>

      {created ? (
        <p
          role="status"
          className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Vehicle created. Add photos below, then set the status to Available to
          publish it.
        </p>
      ) : null}

      {!editable ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You are signed in as a viewer, so this record is read-only.
        </p>
      ) : null}

      {isFeedManaged && vehicle.locked_fields.length > 0 ? (
        <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-bold text-amber-900">
            Protected from feed sync
          </h2>
          <p className="mt-1 text-xs text-amber-900/80">
            You edited these fields by hand, so the partner feed can no longer
            change them. Release one to let the feed manage it again.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {vehicle.locked_fields.map((field) => (
              <li key={field}>
                <form
                  action={unlockVehicleFields.bind(null, vehicle.id, [field])}
                >
                  <button
                    type="submit"
                    disabled={!editable}
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {columnLabel(field)} <span aria-hidden>×</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 space-y-6">
        <PhotoManager
          vehicleId={vehicle.id}
          photos={photos}
          canEdit={editable}
        />

        <div className="max-w-4xl">
          <VehicleForm
            action={updateVehicle.bind(null, vehicle.id)}
            vehicle={vehicle}
            partnerLots={partnerLots ?? []}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </Container>
  );
}
