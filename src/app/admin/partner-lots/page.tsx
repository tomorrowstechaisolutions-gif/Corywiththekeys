import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Partner Lots",
};

export default function AdminPartnerLotsPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Partner Lots"
      description="Dealer and lot partners supplying inventory."
      scope={[
        "Partner directory and contacts",
        "Per-partner inventory feed",
        "Commission and split terms",
        "Performance by partner",
      ]}
    />
  );
}
