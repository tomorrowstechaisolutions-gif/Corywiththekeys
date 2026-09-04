import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Applications" };

/**
 * Stand-in for the Applications route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminLenderApplicationsPage() {
  await requireSection("lender-applications");

  return (
    <PagePlaceholder
      eyebrow="Finance"
      title="Applications"
      description="Applications handed to a lender, and what came back."
      scope={[
        "Which lender each application went to, and when",
        "Approval, decline or counter-offer against the file",
        "Link from the application to the deal it belongs to",
        "Backed by lender_applications, which stores a pointer only — no bank or card data",
      ]}
    />
  );
}
