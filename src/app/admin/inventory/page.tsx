import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  INGESTION_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  vehicleTitle,
  type VehicleStatus,
} from "@/lib/vehicles";
import { VEHICLE_STATUSES } from "@/lib/validation/vehicle";

export const metadata: Metadata = { title: "Inventory" };

type SearchParams = Promise<{ status?: string; q?: string; source?: string }>;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireStaff();
  const { status, q, source } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("vehicles")
    .select(
      "id, slug, year, make, model, trim, vin, price, mileage, status, is_featured, source, ingestion_method, feed_id, locked_fields, updated_at, partner_lots(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (status && VEHICLE_STATUSES.includes(status as VehicleStatus)) {
    query = query.eq("status", status as VehicleStatus);
  }
  if (source === "owned" || source === "partner") {
    query = query.eq("source", source);
  }
  if (q?.trim()) {
    const term = q.trim();
    query = query.or(
      `make.ilike.%${term}%,model.ilike.%${term}%,vin.ilike.%${term}%,stock_number.ilike.%${term}%`,
    );
  }

  const { data: vehicles, error } = await query;

  const counts = new Map<string, number>();
  const { data: all } = await supabase.from("vehicles").select("status");
  for (const row of all ?? []) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  const filters = [
    { label: "All", value: undefined, count: all?.length ?? 0 },
    ...VEHICLE_STATUSES.map((value) => ({
      label: STATUS_LABELS[value],
      value,
      count: counts.get(value) ?? 0,
    })),
  ];

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Inventory</h1>
          <p className="mt-1 text-sm text-navy-700">
            {all?.length ?? 0} vehicle{all?.length === 1 ? "" : "s"} · owned and
            partner-sourced
          </p>
        </div>

        {canWrite(profile) ? (
          <Link
            href="/admin/inventory/new"
            className="rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500"
          >
            Add vehicle
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const active = (status ?? undefined) === filter.value;
          const href = filter.value
            ? `/admin/inventory?status=${filter.value}`
            : "/admin/inventory";

          return (
            <Link
              key={filter.label}
              href={href}
              className={
                active
                  ? "rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-navy-700 hover:border-keyblue-500"
              }
            >
              {filter.label}
              <span className="ml-1.5 opacity-60">{filter.count}</span>
            </Link>
          );
        })}
      </div>

      <form className="mt-4 flex gap-2" action="/admin/inventory">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search make, model, VIN or stock number"
          className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load inventory.
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wider text-navy-700">
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Mileage</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(vehicles ?? []).map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/inventory/${v.id}`}
                    className="font-semibold text-navy-900 hover:text-keyblue-600"
                  >
                    {vehicleTitle(v)}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-navy-700">
                    {v.vin ? <span className="font-mono">{v.vin}</span> : null}
                    {v.is_featured ? (
                      <span className="rounded bg-keyblue-600/10 px-1.5 py-0.5 font-semibold text-keyblue-700">
                        Featured
                      </span>
                    ) : null}
                    {v.locked_fields.length > 0 ? (
                      <span
                        className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900"
                        title={`Protected from feed sync: ${v.locked_fields.join(", ")}`}
                      >
                        {v.locked_fields.length} locked
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[v.status]}`}
                  >
                    {STATUS_LABELS[v.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-navy-900">
                  {v.price === null ? (
                    <span className="text-amber-700">No price</span>
                  ) : (
                    formatCurrency(Number(v.price))
                  )}
                </td>
                <td className="px-4 py-3 text-navy-700">
                  {v.mileage === null
                    ? "—"
                    : `${v.mileage.toLocaleString("en-US")} mi`}
                </td>
                <td className="px-4 py-3 text-navy-700">
                  {SOURCE_LABELS[v.source]}
                  {v.partner_lots ? (
                    <span className="block text-xs text-navy-700/70">
                      {v.partner_lots.name}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-navy-700">
                  {INGESTION_LABELS[v.ingestion_method]}
                </td>
              </tr>
            ))}

            {(vehicles ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-navy-900">
                    No vehicles here yet.
                  </p>
                  <p className="mt-1 text-sm text-navy-700">
                    {q || status
                      ? "Try clearing the filters."
                      : "Add the first one to get the site showing real inventory."}
                  </p>
                  {canWrite(profile) && !q && !status ? (
                    <Link
                      href="/admin/inventory/new"
                      className="mt-4 inline-block rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-keyblue-500"
                    >
                      Add vehicle
                    </Link>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
