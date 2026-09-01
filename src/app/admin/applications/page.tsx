import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Applications",
};

export default function AdminApplicationsPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Applications"
      description="Credit applications submitted through /apply."
      scope={[
        "Application queue with status",
        "Applicant detail and uploaded documents",
        "Lender submission tracking",
        "Approval / decline outcomes",
      ]}
    />
  );
}
