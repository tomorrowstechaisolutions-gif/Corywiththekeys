"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  buildInventoryHref,
  MILEAGE_STEPS,
  PAYMENT_STEPS,
  PRICE_STEPS,
  type FilterFacets,
  type InventoryFilters as Filters,
} from "@/lib/inventory-query";
import { formatCurrency } from "@/lib/utils";

const SELECT =
  "w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

const LABEL = "block text-[10px] font-semibold uppercase tracking-wider text-navy-700/70";

/**
 * Filter bar.
 *
 * Every change writes to the URL rather than to component state, so a
 * filtered view can be bookmarked, shared or texted to a customer, and the
 * back button behaves. The server does the actual filtering.
 */
export function InventoryFilters({
  filters,
  facets,
}: {
  filters: Filters;
  facets: FilterFacets;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [search, setSearch] = useState(filters.q ?? "");

  const modelOptions = useMemo(
    () => (filters.make ? (facets.models[filters.make] ?? []) : []),
    [facets.models, filters.make],
  );

  function apply(patch: Partial<Filters>) {
    // Page 1 on every change: staying on page 4 of a narrower result set
    // usually lands on an empty page.
    const next = buildInventoryHref(filters, { ...patch, page: 1 });
    startTransition(() => router.push(next, { scroll: false }));
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    apply({ q: search.trim() || null });
  }

  const advancedCount = [
    filters.maxMileage,
    filters.bodyStyle,
    filters.source,
  ].filter(Boolean).length;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-navy-950/5 transition-opacity sm:p-5 ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-700/40"
          >
            ⌕
          </span>
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search make, model, stock # or keyword"
            aria-label="Search inventory"
            className="w-full rounded-md border border-slate-300 py-3 pl-9 pr-3 text-sm text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-keyblue-500 sm:px-7"
        >
          Search
        </button>
      </form>

      {/* Primary filters. Always visible from tablet up. */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <label>
          <span className={LABEL}>Make</span>
          <select
            className={SELECT}
            value={filters.make ?? ""}
            onChange={(event) =>
              apply({ make: event.target.value || null, model: null })
            }
          >
            <option value="">All Makes</option>
            {facets.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL}>Model</span>
          <select
            className={SELECT}
            value={filters.model ?? ""}
            disabled={!filters.make}
            onChange={(event) => apply({ model: event.target.value || null })}
          >
            <option value="">
              {filters.make ? "All Models" : "Pick a make first"}
            </option>
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL}>Year</span>
          <select
            className={SELECT}
            value={filters.year ?? ""}
            onChange={(event) =>
              apply({ year: event.target.value ? Number(event.target.value) : null })
            }
          >
            <option value="">Any Year</option>
            {facets.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL}>Price</span>
          <select
            className={SELECT}
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              apply({
                maxPrice: event.target.value ? Number(event.target.value) : null,
              })
            }
          >
            <option value="">Any Price</option>
            {PRICE_STEPS.map((step) => (
              <option key={step} value={step}>
                Under {formatCurrency(step)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL}>Monthly Payment</span>
          <select
            className={SELECT}
            value={filters.maxPayment ?? ""}
            onChange={(event) =>
              apply({
                maxPayment: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          >
            <option value="">Any Payment</option>
            {PAYMENT_STEPS.map((step) => (
              <option key={step} value={step}>
                Under ${step}/mo
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Advanced filters. Collapsed on phones, where a nine-control row is
          unusable; expanded inline on wider screens. */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((value) => !value)}
          aria-expanded={advancedOpen}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-keyblue-500 hover:text-keyblue-700 lg:w-auto"
        >
          <span aria-hidden>≡</span>
          More Filters
          {advancedCount > 0 ? (
            <span className="rounded-full bg-keyblue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {advancedCount}
            </span>
          ) : null}
        </button>

        {advancedOpen ? (
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-3">
            <label>
              <span className={LABEL}>Mileage</span>
              <select
                className={SELECT}
                value={filters.maxMileage ?? ""}
                onChange={(event) =>
                  apply({
                    maxMileage: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              >
                <option value="">Any Mileage</option>
                {MILEAGE_STEPS.map((step) => (
                  <option key={step} value={step}>
                    Under {step.toLocaleString("en-US")} mi
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={LABEL}>Body Style</span>
              <select
                className={SELECT}
                value={filters.bodyStyle ?? ""}
                onChange={(event) =>
                  apply({ bodyStyle: event.target.value || null })
                }
              >
                <option value="">All Body Styles</option>
                {facets.bodyStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={LABEL}>Source</span>
              <select
                className={SELECT}
                value={filters.source ?? ""}
                onChange={(event) =>
                  apply({
                    source:
                      event.target.value === "owned" ||
                      event.target.value === "partner"
                        ? event.target.value
                        : null,
                  })
                }
              >
                <option value="">All Sources</option>
                <option value="owned">The Key Konnect</option>
                <option value="partner">Partner Lot</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {searchParams.size > 0 ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              startTransition(() => router.push("/inventory", { scroll: false }));
            }}
            className="text-xs font-semibold text-navy-700 underline underline-offset-2 hover:text-keyblue-600"
          >
            Clear all filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
