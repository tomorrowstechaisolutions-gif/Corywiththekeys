import type { Metadata } from "next";
import Link from "next/link";

import { FinancingBanner } from "@/components/inventory/FinancingBanner";
import { FindMyCarForm } from "@/components/inventory/FindMyCarForm";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryHero } from "@/components/inventory/InventoryHero";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { ResultsToolbar } from "@/components/inventory/ResultsToolbar";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { Container } from "@/components/ui/Container";
import { publicEnv } from "@/lib/env";
import {
  BANNER_AFTER,
  getFilterFacets,
  hasActiveFilters,
  parseInventoryParams,
  queryInventory,
} from "@/lib/inventory-query";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_DISCLAIMER } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse cars, trucks and SUVs available now through The Key Konnect in Killeen, Texas. Flexible financing, fast approvals, trade-ins welcome.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = parseInventoryParams(params);

  const supabase = await createClient();

  // Facets and results in parallel — neither depends on the other.
  const [{ vehicles, total, pageCount, error }, facets] = await Promise.all([
    queryInventory(supabase, filters),
    getFilterFacets(supabase),
  ]);

  const supabaseUrl = publicEnv.supabaseUrl;
  const filtered = hasActiveFilters(filters);
  const isList = filters.view === "list";

  return (
    <>
      <InventoryHero />

      {/* The filter card overlaps the hero, as in the approved design. */}
      <Container className="relative z-10 -mt-6 lg:-mt-8">
        <InventoryFilters filters={filters} facets={facets} />
      </Container>

      <Container className="py-10 lg:py-12">
        <ResultsToolbar filters={filters} total={total} />

        {error ? (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            We could not load inventory just now. Please refresh, or call Cory
            on 254-987-0063.
          </p>
        ) : null}

        {!error && vehicles.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : null}

        {vehicles.length > 0 ? (
          <>
            <div
              className={
                isList
                  ? "mt-6 grid grid-cols-1 gap-4"
                  : "mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {vehicles.map((vehicle, index) => (
                <PositionedCard
                  key={vehicle.id}
                  index={index}
                  vehicle={vehicle}
                  supabaseUrl={supabaseUrl}
                  layout={filters.view}
                />
              ))}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-navy-700/70">
              {PAYMENT_DISCLAIMER}
            </p>

            <InventoryPagination filters={filters} pageCount={pageCount} />
          </>
        ) : null}
      </Container>

      <FindMyCarSection />
    </>
  );
}

/**
 * Renders a card, and drops the financing banner into the flow after the
 * first few so the grid is broken up rather than an unbroken wall.
 */
function PositionedCard({
  index,
  vehicle,
  supabaseUrl,
  layout,
}: {
  index: number;
  vehicle: Parameters<typeof VehicleCard>[0]["vehicle"];
  supabaseUrl: string;
  layout: "grid" | "list";
}) {
  return (
    <>
      {index === BANNER_AFTER ? <FinancingBanner /> : null}
      <VehicleCard
        vehicle={vehicle}
        supabaseUrl={supabaseUrl}
        layout={layout}
        // Only the first row preloads. The rest lazy-load on scroll.
        priority={index < 4}
      />
    </>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-lg font-bold text-navy-900">
        {filtered
          ? "No vehicles match those filters."
          : "No vehicles listed right now."}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-700">
        {filtered
          ? "Try widening your search — or let Cory go and find it for you."
          : "Inventory moves fast. Tell Cory what you're after and he'll source it."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {filtered ? (
          <Link
            href="/inventory"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:border-keyblue-500 hover:text-keyblue-600"
          >
            Clear Filters
          </Link>
        ) : null}
        <Link
          href="/apply"
          className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-keyblue-500"
        >
          Get Pre-Approved
        </Link>
        <Link
          href="#find-my-car"
          className="rounded-md border border-navy-900 px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
        >
          Have Cory Find My Car
        </Link>
      </div>
    </div>
  );
}

function FindMyCarSection() {
  return (
    <section id="find-my-car" className="scroll-mt-20 border-t border-slate-200 bg-slate-50">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
              Can&rsquo;t Find What You&rsquo;re Looking For?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-700">
              Cory works with multiple inventory sources. Tell us what you want
              and we&rsquo;ll help locate it.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-navy-700/70">
              {PAYMENT_DISCLAIMER}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <FindMyCarForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
