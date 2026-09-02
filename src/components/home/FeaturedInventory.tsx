import Link from "next/link";

import { VehicleCard } from "@/components/inventory/VehicleCard";
import { Container } from "@/components/ui/Container";
import { publicEnv } from "@/lib/env";
import { VEHICLE_CARD_COLUMNS } from "@/lib/inventory-query";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_DISCLAIMER } from "@/lib/vehicles";

import { GetApprovedForm } from "./GetApprovedForm";

/**
 * Featured rail plus the approval form, side by side as in the comp.
 *
 * Featured vehicles come from `is_featured`, falling back to the newest
 * listings so this section is never empty while Cory is still deciding what
 * to promote.
 */
export async function FeaturedInventory() {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("vehicles")
    .select(VEHICLE_CARD_COLUMNS)
    .in("status", ["available", "pending"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const vehicles = featured ?? [];
  const supabaseUrl = publicEnv.supabaseUrl;

  return (
    <section className="bg-slate-50">
      <Container className="py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-navy-900">
                Featured Inventory
                <span
                  aria-hidden
                  className="mt-2 block h-1 w-12 rounded-full bg-gold-500"
                />
              </h2>
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-keyblue-600 transition hover:gap-2.5"
              >
                View All Inventory <span aria-hidden>→</span>
              </Link>
            </div>

            {vehicles.length > 0 ? (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {vehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      supabaseUrl={supabaseUrl}
                      priority={index < 2}
                    />
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-navy-700/70">
                  {PAYMENT_DISCLAIMER}
                </p>
              </>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <p className="text-base font-bold text-navy-900">
                  Fresh inventory is on the way.
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-navy-700">
                  Tell Cory what you&rsquo;re after and he&rsquo;ll source it —
                  or start an approval so you&rsquo;re ready when it lands.
                </p>
                <Link
                  href="/inventory"
                  className="mt-5 inline-block rounded-md border border-navy-900 px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
                >
                  Browse Inventory
                </Link>
              </div>
            )}
          </div>

          <div className="lg:pt-1">
            <GetApprovedForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
