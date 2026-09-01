import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function AdminInventoryPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Inventory"
      description="Vehicle inventory management, including partner-lot units."
      scope={[
        "Create / edit / archive vehicles",
        "Photo management via Supabase Storage",
        "Pricing and payment estimates",
        "Publish and feature controls",
      ]}
    />
  );
}
