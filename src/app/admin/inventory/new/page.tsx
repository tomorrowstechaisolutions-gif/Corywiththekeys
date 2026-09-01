import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { createVehicle } from "../actions";
import { VehicleForm } from "../VehicleForm";

export const metadata: Metadata = { title: "Add vehicle" };

export default async function NewVehiclePage() {
  const profile = await requireStaff();

  if (!canWrite(profile)) {
    redirect("/admin/inventory?error=forbidden");
  }

  const supabase = await createClient();
  const { data: partnerLots } = await supabase
    .from("partner_lots")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <Container className="py-8">
      <nav className="text-xs text-navy-700">
        <Link href="/admin/inventory" className="hover:text-keyblue-600">
          Inventory
        </Link>
        <span className="mx-1.5">/</span>
        <span>Add vehicle</span>
      </nav>

      <h1 className="mt-2 text-2xl font-bold text-navy-900">Add vehicle</h1>
      <p className="mt-1 text-sm text-navy-700">
        Saves as a draft you can photograph and publish. Nothing reaches the
        public site until the status is Available.
      </p>

      <div className="mt-6 max-w-4xl">
        <VehicleForm
          action={createVehicle}
          partnerLots={partnerLots ?? []}
          submitLabel="Create vehicle"
        />
      </div>
    </Container>
  );
}
