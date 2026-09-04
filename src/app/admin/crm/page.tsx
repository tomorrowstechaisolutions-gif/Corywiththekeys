import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "CRM" };

/**
 * Stand-in for the CRM route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminCrmPage() {
  await requireSection("crm");

  return (
    <PagePlaceholder
      eyebrow="Sales"
      title="CRM"
      description="One view of a person: their enquiries, their vehicles, their appointments and every message."
      scope={[
        "Merge a lead and a customer into one person",
        "Full contact timeline in one place",
        "Ownership and next follow-up on the record",
        "Notes staff can add without leaving the screen",
      ]}
    />
  );
}
