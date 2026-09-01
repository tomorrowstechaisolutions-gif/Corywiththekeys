import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Financing",
};

export default function FinancingPage() {
  return (
    <PagePlaceholder
      eyebrow="Financing"
      title="Financing"
      description="Route placeholder for financing options, lender partners and payment education."
      scope={[
        "Credit-situation explainer (bad credit, first-time buyer, flexible down)",
        "Payment calculator",
        "Lender partner list",
        "Hand-off into /apply",
      ]}
    />
  );
}
