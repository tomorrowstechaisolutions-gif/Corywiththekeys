import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Dashboard"
      description="At-a-glance KPIs across leads, applications, inventory and appointments."
      scope={[
        "Lead and application counters",
        "Pipeline value and conversion",
        "Today's appointments",
        "Recent activity feed",
      ]}
    />
  );
}
