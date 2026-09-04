import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Calendar" };

/**
 * Stand-in for the Calendar route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminCalendarPage() {
  await requireSection("calendar");

  return (
    <PagePlaceholder
      eyebrow="Operations"
      title="Calendar"
      description="Appointments and deadlines on one calendar."
      scope={[
        "Day, week and month views",
        "Test drives, deliveries and consultations together",
        "Filter by who the appointment belongs to",
        "Built on the appointments table, which already exists",
      ]}
    />
  );
}
