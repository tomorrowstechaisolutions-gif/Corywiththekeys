import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Messages",
};

export default function AdminMessagesPage() {
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
