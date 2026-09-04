import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Documents" };

/**
 * Stand-in for the Documents route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminDocumentsPage() {
  await requireSection("documents");

  return (
    <PagePlaceholder
      eyebrow="Operations"
      title="Documents"
      description="Paperwork kept against a deal or a vehicle."
      scope={[
        "Upload a title, bill of sale or finance document",
        "Attach a document to a deal, vehicle or customer",
        "Who uploaded it and when",
        "Private storage — never served to the public site",
      ]}
    />
  );
}
