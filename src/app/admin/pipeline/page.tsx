import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function AdminPipelinePage() {
  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Pipeline"
      description="Deal pipeline from first contact through delivery."
      scope={[
        "Kanban stages",
        "Drag-and-drop stage changes",
        "Stage-level forecasting",
        "Aging and stall alerts",
      ]}
    />
  );
}
