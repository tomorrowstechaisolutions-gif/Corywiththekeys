import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Prequalifications",
};

export default async function AdminApplicationsPage() {
  await requireSection("applications");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Prequalifications"
      description="Prequalification requests submitted through /apply. Contact details, employment status and banded income only — no regulated credit data."
      scope={[
        "Prequalification queue with status",
        "Applicant detail and follow-up notes",
        "Hand-off to a lender provider via lender_applications",
        "Outcome tracking",
      ]}
    />
  );
}
