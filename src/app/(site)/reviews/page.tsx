import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function ReviewsPage() {
  return (
    <PagePlaceholder
      eyebrow="Reviews"
      title="Reviews"
      description="Route placeholder for customer reviews and testimonials."
      scope={[
        "Review list with rating summary",
        "Review submission form",
        "Third-party review aggregation",
      ]}
    />
  );
}
