import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Integrations" };

/**
 * Stand-in for the Integrations route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminIntegrationsPage() {
  await requireSection("integrations");

  return (
    <PagePlaceholder
      eyebrow="System"
      title="Integrations"
      description="The outside accounts this console is connected to."
      scope={[
        "Connect Facebook, Instagram and TikTok",
        "Connect an email sender and a phone or texting number",
        "Partner inventory feeds and their sync history",
        "Which connections are live, and which have expired",
      ]}
    />
  );
}
