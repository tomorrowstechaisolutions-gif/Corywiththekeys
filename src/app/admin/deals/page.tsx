import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Deals" };

/**
 * Stand-in for the Deals route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminDealsPage() {
  await requireSection("deals");

  return (
    <PagePlaceholder
      eyebrow="Finance"
      title="Deals"
      description="Sales being worked, from vehicle selected through to delivery."
      scope={[
        "A deal record joining customer, vehicle, trade-in and finance",
        "Sale price, gross profit and expected close",
        "Stage history and why a deal was lost",
        "Backed by the deals table, which already exists",
      ]}
    />
  );
}
