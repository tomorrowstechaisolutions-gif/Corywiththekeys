import type { Metadata } from "next";

import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustBar } from "@/components/home/TrustBar";
import { CONTACT, SITE } from "@/lib/constants";

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
function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: SITE.name,
    description: SITE.headline,
    url: SITE.url,
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "17:00",
      },
    ],
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
