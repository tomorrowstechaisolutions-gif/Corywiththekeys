import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { setPartnerLotActive } from "./actions";
import { PartnerLotForm } from "./PartnerLotForm";

export const metadata: Metadata = { title: "Partner Lots" };

export default async function AdminPartnerLotsPage() {
  const profile = await requireSection("partner-lots");
  const editable = canWrite(profile);

  const supabase = await createClient();

  const [{ data: lots }, { data: vehicles }] = await Promise.all([
    supabase.from("partner_lots").select("*").order("name"),
    supabase.from("vehicles").select("partner_lot_id").not("partner_lot_id", "is", null),
  ]);

  const vehicleCounts = new Map<string, number>();
  for (const row of vehicles ?? []) {
    if (row.partner_lot_id) {
      vehicleCounts.set(
        row.partner_lot_id,
        (vehicleCounts.get(row.partner_lot_id) ?? 0) + 1,
      );
    }
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-navy-900">Partner lots</h1>
      <p className="mt-1 text-sm text-navy-700">
        Dealers and lots supplying inventory. Vehicles attributed to a lot keep
        that attribution whether they were typed in or imported.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wider text-navy-700">
              <th className="px-4 py-3 font-semibold">Lot</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Vehicles</th>
              <th className="px-4 py-3 font-semibold">Public credit</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(lots ?? []).map((lot) => (
              <tr key={lot.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy-900">{lot.name}</p>
                  <p className="text-xs text-navy-700/70">
                    {[lot.city, lot.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-navy-700">
                  {lot.contact_name ? (
                    <span className="block">{lot.contact_name}</span>
                  ) : null}
                  {lot.contact_phone ? (
                    <span className="block text-xs">{lot.contact_phone}</span>
                  ) : null}
                  {!lot.contact_name && !lot.contact_phone ? "—" : null}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/inventory?source=partner`}
                    className="font-medium text-keyblue-600 hover:underline"
                  >
                    {vehicleCounts.get(lot.id) ?? 0}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy-700">
                  {lot.display_on_site ? "Shown" : "Hidden"}
                </td>
                <td className="px-4 py-3">
                  {editable ? (
                    <form
                      action={setPartnerLotActive.bind(
                        null,
                        lot.id,
                        !lot.is_active,
                      )}
                    >
                      <button
                        type="submit"
                        className={
                          lot.is_active
                            ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                            : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-300"
                        }
                      >
                        {lot.is_active ? "Active" : "Inactive"}
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-navy-700">
                      {lot.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {(lots ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-navy-700">
                  No partner lots yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editable ? (
        <div className="mt-6">
          <PartnerLotForm />
        </div>
      ) : null}
    </Container>
  );
}
