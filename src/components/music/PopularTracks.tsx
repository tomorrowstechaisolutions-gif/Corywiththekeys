import { MediaTile } from "@/components/music/MediaTile";
import { SectionHeading } from "@/components/music/SectionHeading";
import { Container } from "@/components/ui/Container";
import { ALL_MUSIC_URL, POPULAR_TRACKS, trackArtwork, trackUrl } from "@/data/cory-links";

export function PopularTracks() {
  if (POPULAR_TRACKS.length === 0) return null;

  return (
    <section className="bg-navy-950 py-8 lg:py-10">
      <Container>
        <SectionHeading
          title="Popular Tracks"
          viewAllLabel="View all music"
          viewAllUrl={ALL_MUSIC_URL}
        />

        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {POPULAR_TRACKS.map((track) => {
            const href = trackUrl(track);

            return (
              <li key={track.title} className="group">
                <MediaTile
                  image={trackArtwork(track)}
                  alt={`${track.title} cover art`}
                  href={href}
                  aspect="square"
                  showPlay={Boolean(href)}
                  sizes="(max-width: 640px) 50vw, 12vw"
                />
                <h3 className="mt-2 text-xs font-bold leading-snug text-white">
                  {track.title}
                </h3>
                {track.featuring ? (
                  <p className="text-[11px] text-white/50">
                    with {track.featuring}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
