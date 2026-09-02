import type { Metadata } from "next";

import { ContactPanel } from "@/components/contact/ContactPanel";
import {
  ContactHero,
  ContactInfoCards,
  NextRideCta,
} from "@/components/contact/ContactSections";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

const DESCRIPTION =
  "Get in touch with The Key Konnect in Killeen, Texas — cars, merch, music and community. Call 254-987-0063 or send a message and we'll reply within one business day.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/contact`,
    siteName: SITE.name,
    type: "website",
  },
};

/** Lets search engines offer the phone number directly in results. */
async function ContactSchema() {
  const { contact } = await getSettings();

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE.name}`,
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      telephone: contact.phone,
      email: contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: [contact.address.line1, contact.address.line2]
          .filter(Boolean)
          .join(", "),
        addressLocality: contact.address.city,
        addressRegion: contact.address.state,
        postalCode: contact.address.postalCode,
        addressCountry: "US",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ContactPage() {
  return (
    <div className="bg-navy-950">
      <ContactSchema />
      <ContactHero />

      <Container className="py-8 lg:py-10">
        <ContactPanel />
      </Container>

      <ContactInfoCards />
      <NextRideCta />
    </div>
  );
}
