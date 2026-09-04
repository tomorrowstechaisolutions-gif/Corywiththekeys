import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "SEO" };

/**
 * Stand-in for the SEO route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminSeoPage() {
  await requireSection("seo");

  return (
    <PagePlaceholder
      eyebrow="Website"
      title="SEO"
      description="How the site shows up in search."
      scope={[
        "Page titles and descriptions per page",
        "Structured data for vehicle listings",
        "Broken links and missing images",
        "Search rankings for the terms that matter in Killeen",
      ]}
    />
  );
}
