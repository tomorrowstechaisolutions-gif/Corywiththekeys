import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Vehicle Requests" };

/**
 * Stand-in for the Vehicle Requests route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminVehicleRequestsPage() {
  await requireSection("vehicle-requests");

  return (
    <PagePlaceholder
      eyebrow="Vehicles"
      title="Vehicle Requests"
      description="Customers asking for a car that is not on the lot yet."
      scope={[
        "Requests from the Find My Car form",
        "Match a request against incoming partner inventory",
        "Tell the customer when something matching arrives",
        "Close the request out when a car is found",
      ]}
    />
  );
}
