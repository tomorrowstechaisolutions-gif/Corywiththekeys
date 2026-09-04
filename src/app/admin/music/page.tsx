import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Music" };

/**
 * Stand-in for the Music route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminMusicPage() {
  await requireSection("music");

  return (
    <PagePlaceholder
      eyebrow="Website"
      title="Music"
      description="The tracks and releases behind the public music page."
      scope={[
        "Add a track, artwork and streaming links",
        "Order what appears on the public page",
        "Take a release down without deleting it",
        "Feeds the existing /music page",
      ]}
    />
  );
}
