import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Apply",
};

export default function ApplyPage() {
  return (
    <PagePlaceholder
      eyebrow="Get Approved"
      title="Apply"
      description="Route placeholder for the multi-step credit application. Submissions write to Supabase and surface in /admin/applications."
      scope={[
        "Multi-step application form with validation",
        "Soft-pull consent and disclosures",
        "Document upload to Supabase Storage",
        "Confirmation + status tracking",
      ]}
    />
  );
}
