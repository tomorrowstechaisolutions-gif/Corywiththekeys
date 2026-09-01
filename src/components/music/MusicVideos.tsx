import { MediaTile } from "@/components/music/MediaTile";
import { SectionHeading } from "@/components/music/SectionHeading";
import { Container } from "@/components/ui/Container";
import { ALL_VIDEOS_URL, MUSIC_VIDEOS, mediaImage, mediaUrl } from "@/data/cory-links";

export function MusicVideos() {
  if (MUSIC_VIDEOS.length === 0) return null;

  return (
    <section className="bg-navy-950 py-8 lg:py-10">
      <Container>
        <SectionHeading
          id="music-videos"
          title="Music Videos"
          viewAllLabel="View all videos"
          viewAllUrl={ALL_VIDEOS_URL}
        />

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MUSIC_VIDEOS.map((video, index) => (
            <li key={video.title} className="group">
              <MediaTile
                image={mediaImage(video)}
                alt={video.title}
                href={mediaUrl(video)}
                priority={index < 2}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <h3 className="mt-2.5 text-sm font-bold text-white">{video.title}</h3>
              {video.subtitle ? (
                <p className="text-xs text-white/55">{video.subtitle}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
