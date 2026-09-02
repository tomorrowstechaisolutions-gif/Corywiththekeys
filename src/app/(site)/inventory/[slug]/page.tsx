import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckAvailabilityForm } from "@/components/inventory/CheckAvailabilityForm";
import {
  VehicleGallery,
  type GalleryPhoto,
} from "@/components/inventory/VehicleGallery";
import { VehicleVideo } from "@/components/inventory/VehicleVideo";
import { Container } from "@/components/ui/Container";
import { CONTACT, SITE } from "@/lib/constants";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  displayPayment,
  PAYMENT_DISCLAIMER,
  PUBLIC_STATUSES,
  STATUS_LABELS,
  vehicleTitle,
} from "@/lib/vehicles";
import {
  TITLE_STATUS_LABELS,
  WARRANTY_STATUS_LABELS,
} from "@/lib/validation/vehicle";

type PageProps = { params: Promise<{ slug: string }> };


const SELECT = `
  *,
  partner_lots ( name, display_on_site, city, state ),
  vehicle_photos ( storage_path, remote_url, alt_text, is_primary, position )
`;

async function loadVehicle(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT)
    .eq("slug", slug)
    .in("status", [...PUBLIC_STATUSES])
    .maybeSingle();
  return data;
}

type LoadedVehicle = NonNullable<Awaited<ReturnType<typeof loadVehicle>>>;

function photoUrl(photo: {
  storage_path: string | null;
  remote_url: string | null;
}): string | null {
  if (photo.remote_url) return photo.remote_url;
  if (!photo.storage_path) return null;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/vehicle-photos/${photo.storage_path}`;
}

function galleryPhotos(vehicle: LoadedVehicle, title: string): GalleryPhoto[] {
  return [...(vehicle.vehicle_photos ?? [])]
    .sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    )
    .flatMap((photo) => {
      const url = photoUrl(photo);
      return url ? [{ url, alt: photo.alt_text ?? title }] : [];
    });
}

/**
 * Public partner rule, same as the cards: the lot is named only when that lot
 * has `display_on_site` set. Nobody is credited until they ask to be.
 */
function sourceLine(vehicle: LoadedVehicle): string | null {
  if (vehicle.source !== "partner") return null;
  const lot = vehicle.partner_lots;
  if (lot?.display_on_site && lot.name) return `Available at ${lot.name}`;
  return "Available through The Key Konnect";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await loadVehicle(slug);
  if (!vehicle) return { title: "Vehicle not found" };

  const title = vehicleTitle(vehicle);
  const photos = galleryPhotos(vehicle, title);
  const price =
    vehicle.price !== null ? ` — ${formatCurrency(Number(vehicle.price))}` : "";

  const description =
    vehicle.description?.slice(0, 160) ??
    `${title} for sale at ${SITE.name} in ${CONTACT.address.city}, ${CONTACT.address.state}.`;

  return {
    title: `${title}${price}`,
    description,
    alternates: { canonical: `/inventory/${vehicle.slug}` },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url: `${SITE.url}/inventory/${vehicle.slug}`,
      siteName: SITE.name,
      type: "website",
      images: photos[0] ? [{ url: photos[0].url, alt: photos[0].alt }] : undefined,
    },
  };
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy-700">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-navy-900">{value}</dd>
    </div>
  );
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await loadVehicle(slug);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const photos = galleryPhotos(vehicle, title);
  const payment = displayPayment(vehicle);
  const source = sourceLine(vehicle);
  const pending = vehicle.status === "pending";

  const mpg =
    vehicle.mpg_city && vehicle.mpg_highway
      ? `${vehicle.mpg_city} city / ${vehicle.mpg_highway} hwy`
      : (vehicle.mpg_city ?? vehicle.mpg_highway)
        ? `${vehicle.mpg_city ?? vehicle.mpg_highway} MPG`
        : null;

  const specs: { label: string; value: string }[] = [
    vehicle.mileage !== null
      ? { label: "Mileage", value: `${vehicle.mileage.toLocaleString("en-US")} mi` }
      : null,
    vehicle.body_type ? { label: "Body", value: vehicle.body_type } : null,
    vehicle.exterior_color
      ? { label: "Exterior", value: vehicle.exterior_color }
      : null,
    vehicle.interior_color
      ? { label: "Interior", value: vehicle.interior_color }
      : null,
    vehicle.transmission
      ? { label: "Transmission", value: vehicle.transmission }
      : null,
    vehicle.drivetrain ? { label: "Drivetrain", value: vehicle.drivetrain } : null,
    vehicle.engine ? { label: "Engine", value: vehicle.engine } : null,
    vehicle.cylinders ? { label: "Cylinders", value: String(vehicle.cylinders) } : null,
    vehicle.fuel_type ? { label: "Fuel", value: vehicle.fuel_type } : null,
    mpg ? { label: "MPG", value: mpg } : null,
    vehicle.doors ? { label: "Doors", value: String(vehicle.doors) } : null,
    vehicle.seating ? { label: "Seats", value: String(vehicle.seating) } : null,
    vehicle.vin ? { label: "VIN", value: vehicle.vin } : null,
    vehicle.stock_number
      ? { label: "Stock #", value: vehicle.stock_number }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <div className="bg-slate-50">
      <Container className="py-6 lg:py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-navy-700">
          <Link href="/inventory" className="hover:text-keyblue-600">
            Inventory
          </Link>
          <span className="mx-1.5" aria-hidden>
            /
          </span>
          <span className="text-navy-700/70">{title}</span>
        </nav>

        {/*
          Explicit ordering, because the mobile stack and the desktop columns
          want different sequences. On a phone the price and the call button
          belong straight after the photos — a shopper should not scroll past
          the whole spec sheet to find out what the car costs. On desktop the
          rail sits alongside and the reading order is restored.
        */}
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_23rem] lg:gap-10">
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <VehicleGallery photos={photos} title={title} />

            {vehicle.video_url ? (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold text-navy-900">
                  Walkaround
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                  />
                </h2>
                <div className="mt-4">
                  <VehicleVideo url={vehicle.video_url} title={title} />
                </div>
              </section>
            ) : null}
          </div>

          <div className="order-3 lg:col-start-1 lg:row-start-2">
            {vehicle.description ? (
              <section className="lg:mt-0">
                <h2 className="text-lg font-extrabold text-navy-900">
                  About this vehicle
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                  />
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-navy-700">
                  {vehicle.description}
                </p>
              </section>
            ) : null}

            {specs.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold text-navy-900">
                  Specifications
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                  />
                </h2>
                <dl className="mt-4 grid gap-x-10 rounded-xl border border-slate-200 bg-white px-5 py-2 sm:grid-cols-2">
                  {specs.map((spec) => (
                    <SpecRow key={spec.label} {...spec} />
                  ))}
                </dl>
              </section>
            ) : null}

            {vehicle.features.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold text-navy-900">
                  Features
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                  />
                </h2>
                <ul className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicle.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2 text-sm text-navy-700"
                    >
                      <span aria-hidden className="text-keyblue-600">
                        ·
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/*
              Disclosures.
              Title status is stated on every listing, not only when there is
              something to admit — "clean" is only meaningful to a buyer if the
              absence of a note is not the alternative.
            */}
            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-navy-900">
                Title &amp; warranty
                <span
                  aria-hidden
                  className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                />
              </h2>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <dl className="grid gap-x-10 sm:grid-cols-2">
                  <SpecRow
                    label="Title"
                    value={TITLE_STATUS_LABELS[vehicle.title_status]}
                  />
                  <SpecRow
                    label="Warranty"
                    value={WARRANTY_STATUS_LABELS[vehicle.warranty_status]}
                  />
                </dl>

                {vehicle.warranty_details ? (
                  <p className="mt-3 text-sm leading-relaxed text-navy-700">
                    {vehicle.warranty_details}
                  </p>
                ) : null}

                {vehicle.title_status !== "clean" &&
                vehicle.title_status !== "not_disclosed" ? (
                  <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    This vehicle has a branded title. Ask Cory what that means
                    for insurance and financing before you buy — he will tell
                    you straight.
                  </p>
                ) : null}

                {vehicle.history_report_url ? (
                  <a
                    href={vehicle.history_report_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:border-keyblue-500 hover:text-keyblue-600"
                  >
                    View the vehicle history report
                    <span aria-hidden>↗</span>
                  </a>
                ) : null}
              </div>
            </section>
          </div>

          {/* Sticky rail: price, the ask, and the two ways to act. */}
          <aside className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              {pending ? (
                <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  {STATUS_LABELS.pending}
                </p>
              ) : null}

              <h1 className="text-2xl font-extrabold leading-tight text-navy-900">
                {title}
              </h1>

              {source ? (
                <p className="mt-1.5 text-xs font-medium text-keyblue-700">
                  {source}
                </p>
              ) : null}

              <div className="mt-4">
                {vehicle.price !== null ? (
                  <p className="text-3xl font-extrabold tracking-tight text-navy-900">
                    {formatCurrency(Number(vehicle.price))}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-navy-900">
                    Call for price
                  </p>
                )}

                {vehicle.previous_price !== null &&
                vehicle.price !== null &&
                Number(vehicle.previous_price) > Number(vehicle.price) ? (
                  <p className="mt-1 text-sm text-navy-700/70">
                    <span className="line-through">
                      {formatCurrency(Number(vehicle.previous_price))}
                    </span>{" "}
                    <span className="font-semibold text-emerald-700">
                      price drop
                    </span>
                  </p>
                ) : null}

                {payment ? (
                  <p className="mt-2 text-sm text-navy-700">
                    Around{" "}
                    <span className="font-bold text-navy-900">
                      {formatCurrency(payment)}/mo
                    </span>{" "}
                    with approved credit*
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid gap-2.5">
                <Link
                  href="/finance"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition hover:bg-gold-400"
                >
                  Get Pre-Approved <span aria-hidden>→</span>
                </Link>
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-900 px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
                >
                  Call or text {CONTACT.phone}
                </a>
              </div>

              {payment ? (
                <p className="mt-4 text-[11px] leading-relaxed text-navy-700/70">
                  {PAYMENT_DISCLAIMER}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <CheckAvailabilityForm
                vehicleId={vehicle.id}
                vehicleTitle={title}
              />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
