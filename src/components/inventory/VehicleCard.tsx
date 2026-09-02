import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/inventory/FavoriteButton";
import type { InventoryVehicle } from "@/lib/inventory-query";
import { formatCurrency } from "@/lib/utils";
import { displayPayment, vehicleBadge, vehicleTitle } from "@/lib/vehicles";

/**
 * Pick the image to lead with: the one staff marked primary, else the first
 * in gallery order.
 */
function leadPhoto(vehicle: InventoryVehicle) {
  const photos = [...(vehicle.vehicle_photos ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
  return photos[0] ?? null;
}

function photoUrl(
  photo: { storage_path: string | null; remote_url: string | null },
  supabaseUrl: string,
): string | null {
  if (photo.remote_url) return photo.remote_url;
  if (!photo.storage_path) return null;
  return `${supabaseUrl}/storage/v1/object/public/vehicle-photos/${photo.storage_path}`;
}

/**
 * Public partner rule: the lot's own name only appears when that lot has
 * `display_on_site` set. RLS already withholds the row otherwise, so an
 * undisplayed partner simply reads as "Available through The Key Konnect".
 */
function sourceLine(vehicle: InventoryVehicle): string | null {
  if (vehicle.source !== "partner") return null;

  const lot = vehicle.partner_lots;
  if (lot?.display_on_site && lot.name) return `Available at ${lot.name}`;
  return "Available through The Key Konnect";
}

export function VehicleCard({
  vehicle,
  supabaseUrl,
  priority = false,
  layout = "grid",
}: {
  vehicle: InventoryVehicle;
  supabaseUrl: string;
  /** Only the first row should preload; everything else lazy-loads. */
  priority?: boolean;
  layout?: "grid" | "list";
}) {
  const title = vehicleTitle(vehicle);
  const photo = leadPhoto(vehicle);
  const url = photo ? photoUrl(photo, supabaseUrl) : null;
  const badge = vehicleBadge(vehicle);
  const payment = displayPayment(vehicle);
  const source = sourceLine(vehicle);

  const specs = [
    vehicle.mileage !== null
      ? `${vehicle.mileage.toLocaleString("en-US")} miles`
      : null,
    vehicle.transmission,
    vehicle.drivetrain,
  ].filter(Boolean);

  const isList = layout === "list";

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-keyblue-400 hover:shadow-lg hover:shadow-navy-950/5 ${
        isList ? "sm:flex" : "flex flex-col"
      }`}
    >
      <div
        className={`relative bg-slate-100 ${isList ? "aspect-4/3 sm:aspect-auto sm:w-72 sm:shrink-0" : "aspect-4/3"}`}
      >
        {url ? (
          <Image
            src={url}
            alt={photo?.alt_text ?? title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={
              isList
                ? "(max-width: 640px) 100vw, 288px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            }
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-navy-700/50">
            Photos coming soon
          </div>
        )}

        {badge ? (
          <span
            className={`absolute left-2.5 top-2.5 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        ) : null}

        <FavoriteButton vehicleId={vehicle.id} label={title} />
      </div>

      <div className={`flex flex-1 flex-col p-4 ${isList ? "sm:p-5" : ""}`}>
        <h3 className="text-base font-bold leading-snug text-navy-900">
          <Link href={`/inventory/${vehicle.slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        {specs.length > 0 ? (
          <p className="mt-1 text-xs text-navy-700">{specs.join(" • ")}</p>
        ) : null}

        {source ? (
          <p className="mt-1 text-xs font-medium text-keyblue-700">{source}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div>
            {vehicle.price !== null ? (
              <p className="text-xl font-extrabold tracking-tight text-navy-900">
                {formatCurrency(Number(vehicle.price))}
              </p>
            ) : (
              <p className="text-sm font-bold text-navy-900">Call for price</p>
            )}

            {vehicle.previous_price !== null &&
            vehicle.price !== null &&
            Number(vehicle.previous_price) > Number(vehicle.price) ? (
              <p className="text-xs text-navy-700/70 line-through">
                {formatCurrency(Number(vehicle.previous_price))}
              </p>
            ) : null}
          </div>

          {payment ? (
            <p className="text-sm font-semibold text-keyblue-600">
              Est. ${payment}/mo*
            </p>
          ) : null}
        </div>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-keyblue-600 transition group-hover:gap-2.5">
          View Details <span aria-hidden>→</span>
        </p>
      </div>
    </article>
  );
}
