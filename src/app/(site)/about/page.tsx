import type { Metadata } from "next";

import { AboutHero } from "@/components/about/AboutHero";
import { Community } from "@/components/about/Community";
import { OurStory } from "@/components/about/OurStory";
import { Values } from "@/components/about/Values";
import { NeedARide } from "@/components/music/NeedARide";
import { SITE } from "@/lib/constants";

const DESCRIPTION =
  "More than a car lot. The story behind Cory With The Keys and The Key Konnect in Killeen, Texas — built on trust, loyalty and community.";

export const metadata: Metadata = {
  title: "About Cory With The Keys",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${SITE.personality} | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/about`,
    siteName: SITE.name,
    type: "website",
    images: [
      {
        url: "/brand/about/hero-team.webp",
        width: 1240,
        height: 620,
        alt: "The Key Konnect team beneath the dealership sign in Killeen, Texas",
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-navy-950">
      <AboutHero />
      <OurStory />
      <Values />
      <Community />
      <NeedARide />
    </div>
  );
}
