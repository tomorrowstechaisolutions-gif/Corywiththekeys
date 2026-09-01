import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Music",
};

export default function MusicPage() {
  return (
    <PagePlaceholder
      eyebrow="Music"
      title="Music"
      description="Route placeholder for the music side of the personal brand."
      scope={[
        "Release list and embedded players",
        "Streaming platform links",
        "Booking enquiry hand-off",
      ]}
    />
  );
}
