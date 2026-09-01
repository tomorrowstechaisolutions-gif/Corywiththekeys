import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  // Admin only. Sales and viewer are redirected to the dashboard.
  await requireRole("admin");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Settings"
      description="Business, user and integration configuration. Restricted to admins."
      scope={[
        "Business profile, hours and contact details",
        "Team members — invite, assign role, set job title, activate/deactivate",
        "Notification preferences",
        "Integration keys and webhooks",
      ]}
    />
  );
}
