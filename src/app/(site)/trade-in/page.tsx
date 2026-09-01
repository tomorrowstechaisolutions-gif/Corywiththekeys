import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Trade-In",
};

export default function TradeInPage() {
  return (
    <PagePlaceholder
      eyebrow="Trade-In"
      title="Trade-In"
      description="Route placeholder for trade-in valuation requests. Submissions surface in /admin/trade-ins."
      scope={[
        "Vehicle details form (VIN, mileage, condition)",
        "Photo upload to Supabase Storage",
        "Estimated value range",
        "Appointment scheduling hand-off",
      ]}
    />
  );
}
