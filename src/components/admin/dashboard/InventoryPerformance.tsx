import Image from "next/image";
import Link from "next/link";

import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";
import type { InventoryRow } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/utils";

/**
 * Featured stock, and how much interest it has drawn.
 *
 * Enquiries are real — they are leads carrying that vehicle's id. Views and
 * saves are NOT: nothing on the public site records a page view, and saved
 * vehicles live in the visitor's own browser and never reach the server. Both
 * columns say so rather than showing a zero, which would read as "nobody
 * looked" instead of "nobody is counting".
 */
export function InventoryPerformance({
  vehicles,
  photoBase,
}: {
  vehicles: readonly InventoryRow[];
  /** Public storage prefix for vehicle photos, or null if unavailable. */
  photoBase: string | null;
}) {
  return (
    <DashboardCard
      title="Featured inventory"
      subtitle="Featured first, then longest on the lot"
      action={{ label: "View all inventory", href: "/admin/inventory" }}
      bodyClassName="px-0 pb-0 pt-2"
    >
      {vehicles.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState
            title="Nothing available yet"
            detail="Vehicles show here once their status is Available."
            action={{ label: "Add a vehicle", href: "/admin/inventory/new" }}
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th scope="col" className="whitespace-nowrap px-4 py-2 font-semibold">
                    Vehicle
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">
                    Price
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">
                    Days on lot
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">
                    Enquiries
                  </th>
                  {/* One column, not two: both are unrecorded for the same
                      reason, and two columns of "Not tracked" is just noise. */}
                  <th scope="col" className="whitespace-nowrap px-4 py-2 font-semibold">
                    Views &amp; saves
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/inventory/${vehicle.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100">
                          {vehicle.photoPath && photoBase ? (
                            <Image
                              src={`${photoBase}/${vehicle.photoPath}`}
                              alt=""
                              width={56}
                              height={40}
                              className="h-10 w-14 object-cover"
                            />
                          ) : (
                            <span className="text-[9px] font-semibold uppercase text-slate-400">
                              No photo
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[190px] truncate font-medium text-navy-900">
                            {vehicle.title}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {vehicle.mileage !== null
                              ? `${vehicle.mileage.toLocaleString("en-US")} miles`
                              : "Mileage not set"}
                            {vehicle.stockNumber ? ` · ${vehicle.stockNumber}` : ""}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 font-medium text-navy-900">
                      {vehicle.price === null ? "—" : formatCurrency(vehicle.price)}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 text-slate-600">
                      {vehicle.daysOnLot === null ? "—" : vehicle.daysOnLot}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 font-medium text-navy-900">
                      {vehicle.inquiries}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                      Not tracked
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-snug text-slate-400">
            Enquiries are leads attached to that vehicle. Page views are not
            recorded anywhere yet, and saved vehicles stay in the visitor&rsquo;s
            own browser — neither can be counted until something is set up to
            count them.
          </p>
        </>
      )}
    </DashboardCard>
  );
}
