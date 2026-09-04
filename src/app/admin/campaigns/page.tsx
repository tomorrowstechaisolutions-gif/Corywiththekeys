import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Campaigns" };

/**
 * Stand-in for the Campaigns route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminCampaignsPage() {
  await requireSection("campaigns");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Campaigns"
      description="Paid and organic pushes, and what they cost."
      scope={[
        "A campaign record with dates, budget and goal",
        "Leads attributed by utm_source, which leads already store",
        "Results against what was spent",
        "Compare one campaign with another",
      ]}
    />
  );
}
