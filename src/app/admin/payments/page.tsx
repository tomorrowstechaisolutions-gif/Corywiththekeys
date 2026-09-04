import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = { title: "Payments" };

/**
 * Stand-in for the Payments route.
 *
 * The route exists, the navigation reaches it and requireSection() guards it,
 * so access can be set up before the screen is built. Nothing here reads or
 * writes data — the scope list is the plan, not a claim about what works.
 */
export default async function AdminPaymentsPage() {
  await requireSection("payments");

  return (
    <PagePlaceholder
      eyebrow="Finance"
      title="Payments"
      description="Money taken and money still owed."
      scope={[
        "Deposits and down payments against a deal",
        "What is outstanding, and when it is due",
        "Receipts a customer can be sent",
        "No card processor is connected yet — nothing here takes payment",
      ]}
    />
  );
}
