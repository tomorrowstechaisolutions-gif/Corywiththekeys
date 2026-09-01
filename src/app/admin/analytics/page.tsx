import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AdminAnalyticsPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Analytics"
      description="Traffic, lead and sales performance reporting."
      scope={[
        "Lead source attribution",
        "Funnel conversion rates",
        "Inventory turn and days on lot",
        "Revenue and margin reporting",
      ]}
    />
  );
}
