import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Marketing Dashboard" };

/**
 * Stand-in for the Marketing Dashboard route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminMarketingPage() {
  await requireSection("marketing");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Marketing Dashboard"
      description="How the advertising is doing, in one place."
      scope={[
        "Spend and leads by channel",
        "Cost per lead and cost per sale",
        "Which campaigns produced which leads",
        "Needs the ad accounts connected before any of this is real",
      ]}
    />
  );
}
