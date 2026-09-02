import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { canWrite, requireSection } from "@/lib/auth";
import { INTAKE_REQUIREMENTS } from "@/lib/intake";
import { createClient } from "@/lib/supabase/server";
import { vehicleTitle } from "@/lib/vehicles";

import { VinCapture } from "./VinCapture";

export const metadata: Metadata = { title: "Vehicle intake" };
export const dynamic = "force-dynamic";

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const profile = await requireSection("inventory");
  const { submitted } = await searchParams;

  if (!canWrite(profile)) {
    redirect("/admin/inventory?error=forbidden");
  }

  const supabase = await createClient();

  // Anything this person started and never finished. Losing a half-captured
  // car because the phone locked is the failure this page exists to avoid.
  const { data: unfinished } = await supabase
    .from("vehicles")
    .select("id, year, make, model, trim, vin, intake_status, intake_note")
    .in("intake_status", ["in_progress", "returned"])
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-navy-900">Add a vehicle</h1>
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
        >
          Inventory
        </Link>
      </div>

      {submitted ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800"
        >
          Sent for review. Cory or an admin will check it before it goes live.
          You can start the next car below.
        </p>
      ) : null}

      <p className="mt-3 text-sm text-navy-700">
        Scan the VIN, take some pictures, send it in. Before you can submit,
        you need {INTAKE_REQUIREMENTS.length} things:{" "}
        {INTAKE_REQUIREMENTS.join(", ").toLowerCase()}.
      </p>

      <div className="mt-5">
        <VinCapture />
      </div>

      {(unfinished ?? []).length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-navy-900">Not finished yet</h2>
          <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {(unfinished ?? []).map((vehicle) => (
              <li key={vehicle.id}>
                <Link
                  href={`/admin/intake/${vehicle.id}`}
                  className="block px-4 py-3 transition hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-navy-900">
                    {vehicleTitle(vehicle)}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-navy-700/70">
                    {vehicle.vin ?? "No VIN"}
                  </p>
                  {vehicle.intake_status === "returned" ? (
                    <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                      Sent back: {vehicle.intake_note ?? "needs another look."}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
