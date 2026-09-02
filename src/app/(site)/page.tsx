import type { Metadata } from "next";

import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustBar } from "@/components/home/TrustBar";
import { SITE } from "@/lib/constants";
import { getSettings, openingHoursSpecification } from "@/lib/settings";

export const metadata: Metadata = {
  title: SITE.headline,
  description:
    "Cars, trucks and SUVs in Killeen, Texas with easy financing and fast approvals. Bad credit OK, first-time buyers welcome, trade-ins accepted. Call or text 254-987-0063.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.headline}`,
    description:
      "From cash cars to near-nascars — easy financing, fast approvals, and a better car-buying experience.",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
};

/**
 * Structured data so Google can show the lot's hours, phone and address
 * directly in search results — worth more than any on-page SEO copy for a
 * local dealership.
 */
async function LocalBusinessSchema() {
  const settings = await getSettings();
  const { contact } = settings;

  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: SITE.name,
    description: SITE.headline,
    url: SITE.url,
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
    // Generated from the saved hours, so editing them in Settings updates
    // what Google shows rather than leaving this quietly wrong.
    openingHoursSpecification: openingHoursSpecification(settings),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      <HomeHero />
      <FeaturedInventory />
      <TrustBar />
      <CustomerReviews />
    </>
  );
}
