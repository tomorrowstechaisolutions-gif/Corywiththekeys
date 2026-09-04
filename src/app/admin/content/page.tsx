import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Content Studio" };

/**
 * Stand-in for the Content Studio route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminContentPage() {
  await requireSection("content");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Content Studio"
      description="Write and schedule posts, photos and video."
      scope={[
        "Compose once, publish to several accounts",
        "Pull vehicle photos straight from inventory",
        "Schedule ahead and see the week at a glance",
        "Save the wording that works as a reusable template",
      ]}
    />
  );
}
