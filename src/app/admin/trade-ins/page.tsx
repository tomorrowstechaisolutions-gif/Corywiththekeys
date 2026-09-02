import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Trade-Ins",
};

export default async function AdminTradeInsPage() {
  await requireSection("trade-ins");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Trade-Ins"
      description="Trade-in valuation requests submitted through /trade-in."
      scope={[
        "Request queue with vehicle details",
        "Photo review",
        "Offer entry and history",
        "Conversion into a deal",
      ]}
    />
  );
}
