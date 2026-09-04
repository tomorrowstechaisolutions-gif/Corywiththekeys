import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Tasks" };

/**
 * Stand-in for the Tasks route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminTasksPage() {
  await requireSection("tasks");

  return (
    <PagePlaceholder
      eyebrow="Operations"
      title="Tasks"
      description="What each person needs to get done."
      scope={[
        "Assign a task to a member of staff",
        "Due dates and priority",
        "Tasks raised automatically from a lead's follow-up date",
        "Tick off from the dashboard's Today panel",
      ]}
    />
  );
}
