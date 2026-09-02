import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Leads",
};

export default async function AdminLeadsPage() {
  await requireSection("leads");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Leads"
      description="Inbound leads from every form on the public site."
      scope={[
        "Lead table with source, status and owner",
        "Lead detail drawer with activity timeline",
        "Assignment and follow-up tasks",
        "Bulk status changes",
      ]}
    />
  );
}
