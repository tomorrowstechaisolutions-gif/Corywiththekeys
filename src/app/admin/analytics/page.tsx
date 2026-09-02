import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AdminAnalyticsPage() {
  // Admin only — revenue and margin reporting is not a sales-role view.
  await requireSection("analytics");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Analytics"
      description="Traffic, lead and sales performance reporting. Restricted to admins."
      scope={[
        "Lead source attribution",
        "Funnel conversion rates",
        "Inventory turn and days on lot",
        "Revenue and margin reporting",
        "Form abuse and spam rates from form_submissions",
      ]}
    />
  );
}
