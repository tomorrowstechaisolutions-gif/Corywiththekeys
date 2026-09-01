import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <PagePlaceholder
      eyebrow="Inventory"
      title="Inventory"
      description="Route placeholder for the searchable vehicle inventory. Listings are served from Supabase once the schema exists."
      scope={[
        "Filter + sort controls (make, model, year, price, body type, payment)",
        "Paginated vehicle grid with photos from Supabase Storage",
        "Saved / favorite vehicles",
        "Partner-lot sourced listings",
      ]}
    />
  );
}
