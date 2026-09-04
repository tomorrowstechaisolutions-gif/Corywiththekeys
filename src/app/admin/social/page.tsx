import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Social Center" };

/**
 * Stand-in for the Social Center route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminSocialPage() {
  await requireSection("social");

  return (
    <PagePlaceholder
      eyebrow="Marketing"
      title="Social Center"
      description="Posts and performance across the social accounts."
      scope={[
        "Facebook, Instagram and TikTok in one view",
        "Reach, engagement and video views per post",
        "Which posts produced enquiries",
        "Needs each account connected on Integrations first",
      ]}
    />
  );
}
