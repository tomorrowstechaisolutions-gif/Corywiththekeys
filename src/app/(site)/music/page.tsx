import type { Metadata } from "next";

import { FollowCory } from "@/components/music/FollowCory";
import { Interviews } from "@/components/music/Interviews";
import { MusicHeroSection } from "@/components/music/MusicHeroSection";
import { MusicVideos } from "@/components/music/MusicVideos";
import { NeedARide } from "@/components/music/NeedARide";
import { NewRelease } from "@/components/music/NewRelease";
import { OnRepeat } from "@/components/music/OnRepeat";
import { PopularTracks } from "@/components/music/PopularTracks";
import { SongPlayer } from "@/components/music/SongPlayer";
import { LINKTREE_URL, PROFILES } from "@/data/cory-links";
import { SITE } from "@/lib/constants";

const DESCRIPTION =
  "Official music, videos, interviews and releases from Cory With The Keys.";

/** Only profiles that actually have a URL. Never a guess. */
const SAME_AS = [
  LINKTREE_URL,
  ...PROFILES.map((profile) => profile.url),
].filter((url): url is string => Boolean(url));

export const metadata: Metadata = {
  title: "Cory With The Keys Music",
  description: DESCRIPTION,
  alternates: { canonical: "/music" },
  openGraph: {
    title: `Cory With The Keys Music | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/music`,
    siteName: SITE.name,
    type: "profile",
    images: [
      {
        url: "/brand/music-hero.webp",
        width: 2000,
        height: 800,
        alt: "Cory With The Keys performing under stage lights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Cory With The Keys Music | ${SITE.name}`,
    description: DESCRIPTION,
    images: ["/brand/music-hero.webp"],
  },
};

/**
 * Structured data for the artist.
 *
 * `sameAs` is deliberately built from whatever real profile URLs exist in
 * the link config — right now that is the Linktree only. Listing a URL here
 * that does not resolve would be worse than listing nothing, so the array is
 * derived, never hard-coded.
 */
function MusicianSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: SITE.personality,
    url: `${SITE.url}/music`,
    description: DESCRIPTION,
    image: `${SITE.url}/brand/music-hero.webp`,
    sameAs: SAME_AS,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function MusicPage() {
  return (
    <div className="bg-navy-950">
      <MusicianSchema />
      <MusicHeroSection />
      <NewRelease />
      <OnRepeat />
      <MusicVideos />
      <PopularTracks />
      <Interviews />
      <FollowCory />
      <NeedARide />
      <SongPlayer />
    </div>
  );
}
