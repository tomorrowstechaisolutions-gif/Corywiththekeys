"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  buildInventoryHref,
  SORT_OPTIONS,
  type InventoryFilters,
  type SortValue,
} from "@/lib/inventory-query";

/** Result count on the left; view toggle and sort on the right. */
export function ResultsToolbar({
  filters,
  total,
}: {
  filters: InventoryFilters;
  total: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const viewButton = (view: "grid" | "list", label: string, icon: string) => {
    const active = filters.view === view;
    return (
      <Link
        href={buildInventoryHref(filters, { view })}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
          active
            ? "bg-keyblue-600 text-white"
            : "text-navy-700 hover:bg-slate-100"
        }`}
      >
        <span aria-hidden>{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-navy-900 sm:text-xl">
        {total.toLocaleString("en-US")}{" "}
        {total === 1 ? "Vehicle" : "Vehicles"} Available
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border border-slate-200 p-0.5">
          {viewButton("grid", "Grid", "▦")}
          {viewButton("list", "List", "☰")}
        </div>

        <label className="flex items-center gap-2 text-sm text-navy-700">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              startTransition(() =>
                router.push(
                  buildInventoryHref(filters, {
                    sort: event.target.value as SortValue,
                    page: 1,
                  }),
                  { scroll: false },
                ),
              )
            }
            aria-label="Sort vehicles"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-navy-900 outline-none focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
