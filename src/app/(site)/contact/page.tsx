import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      eyebrow="Contact"
      title="Contact"
      description="Route placeholder for contact details, hours, map and the general enquiry form."
      scope={[
        "Contact form writing to Supabase",
        "Address, hours and directions",
        "Call / text shortcuts",
      ]}
    />
  );
}
