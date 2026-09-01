import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AdminSettingsPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Settings"
      description="Business, user and integration configuration."
      scope={[
        "Business profile, hours and contact details",
        "Team members and roles",
        "Notification preferences",
        "Integration keys and webhooks",
      ]}
    />
  );
}
