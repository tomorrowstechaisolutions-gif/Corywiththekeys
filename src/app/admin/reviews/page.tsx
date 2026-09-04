import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Reviews" };

/**
 * Stand-in for the Reviews route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminReviewsPage() {
  await requireSection("reviews");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Reviews"
      description="Customer reviews waiting to be approved or answered."
      scope={[
        "Approve, hide or reply to a review",
        "Ask a customer for one after delivery",
        "Show approved reviews on the public site",
        "Backed by the reviews table, which already exists",
      ]}
    />
  );
}
