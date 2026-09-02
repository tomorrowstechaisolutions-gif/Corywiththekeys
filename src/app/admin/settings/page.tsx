import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  // Admin only. Sales and viewer are redirected to the dashboard.
  await requireSection("settings");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Settings"
      description="Business and integration configuration. Staff access lives on the Team screen."
      scope={[
        "Business profile, hours and contact details",
        "Notification preferences",
        "Integration keys and webhooks",
      ]}
    />
  );
}
