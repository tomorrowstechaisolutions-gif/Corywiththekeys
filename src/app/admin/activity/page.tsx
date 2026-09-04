import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Activity Center" };

/**
 * Stand-in for the Activity Center route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminActivityPage() {
  await requireSection("activity");

  return (
    <PagePlaceholder
      eyebrow="Command"
      title="Activity Center"
      description="Everything that changed in the console, and who changed it."
      scope={[
        "One feed across leads, vehicles, deals and appointments",
        "Filter by person, by table or by date",
        "Drill through to the record that changed",
        "Backed by audit_log, which is already recording",
      ]}
    />
  );
}
