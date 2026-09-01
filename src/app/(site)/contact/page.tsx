import type { Metadata } from "next";

import { ContactPanel } from "@/components/contact/ContactPanel";
import {
  ContactHero,
  ContactInfoCards,
  NextRideCta,
} from "@/components/contact/ContactSections";
import { Container } from "@/components/ui/Container";
import { CONTACT, SITE } from "@/lib/constants";

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
function ContactSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE.name}`,
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      telephone: CONTACT.phone,
      email: CONTACT.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
        addressLocality: CONTACT.address.city,
        addressRegion: CONTACT.address.state,
        postalCode: CONTACT.address.postalCode,
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
