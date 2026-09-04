import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "AI Command Center" };

/**
 * Stand-in for the AI Command Center route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminAiPage() {
  await requireSection("ai");

  return (
    <PagePlaceholder
      eyebrow="Command"
      title="AI Command Center"
      description="Where the assistant's suggestions live, and where you tell it what to do about them."
      scope={[
        "Prioritised list of what needs attention today",
        "Draft follow-up messages for leads that have gone quiet",
        "Pricing and aging suggestions for vehicles on the lot",
        "A record of what the assistant did, and who approved it",
      ]}
    />
  );
}
