import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Email Marketing" };

/**
 * Stand-in for the Email Marketing route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminEmailMarketingPage() {
  await requireSection("email-marketing");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Email Marketing"
      description="Mail-outs to the customer list."
      scope={[
        "Build a list from customers and leads",
        "Send a new-arrivals or price-drop mail-out",
        "Opens, clicks and unsubscribes",
        "Needs an email sender connected, and consent recorded before anything sends",
      ]}
    />
  );
}
