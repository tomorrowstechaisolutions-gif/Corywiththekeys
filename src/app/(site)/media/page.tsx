import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Media",
};

export default function MediaPage() {
  return (
    <PagePlaceholder
      eyebrow="Media"
      title="Media"
      description="Route placeholder for video, photo and press content."
      scope={[
        "Video gallery",
        "Photo gallery from Supabase Storage",
        "Press mentions and features",
      ]}
    />
  );
}
