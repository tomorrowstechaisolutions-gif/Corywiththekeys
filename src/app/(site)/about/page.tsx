import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="About"
      title="About"
      description="Route placeholder for the Cory With The Keys story and The Key Konnect brand."
      scope={[
        "Founder story and brand mission",
        "How the buying process works",
        "Press and community presence",
      ]}
    />
  );
}
