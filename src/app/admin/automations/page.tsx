import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Automations" };

/**
 * Stand-in for the Automations route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminAutomationsPage() {
  await requireSection("automations");

  return (
    <PagePlaceholder
      eyebrow="System"
      title="Automations"
      description="Rules that do something on their own."
      scope={[
        "Follow up automatically when a lead goes quiet",
        "Alert someone when a car has sat too long",
        "Post to social when a vehicle is published",
        "Every rule shows what it did, and can be switched off",
      ]}
    />
  );
}
