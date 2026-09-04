import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Website" };

/**
 * Stand-in for the Website route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminWebsitePage() {
  await requireSection("website");

  return (
    <PagePlaceholder
      eyebrow="Website"
      title="Website"
      description="The public pages and what they say."
      scope={[
        "Edit homepage copy and hero images without a developer",
        "Publish and unpublish pages",
        "Preview a change before it goes live",
        "Business details still live on Settings",
      ]}
    />
  );
}
