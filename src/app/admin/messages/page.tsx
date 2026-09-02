import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function AdminMessagesPage() {
  await requireSection("messages");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Messages"
      description="Unified inbox for site enquiries and follow-ups."
      scope={[
        "Threaded conversations",
        "Templates and quick replies",
        "Assignment and read state",
        "Links back to lead records",
      ]}
    />
  );
}
