import { LoopingVideo } from "@/components/music/LoopingVideo";
import { Container } from "@/components/ui/Container";
import {
  FEATURED_VIDEO,
  YOUTUBE_CHANNEL_URL,
  youtubeWatchUrl,
} from "@/data/cory-links";

/** The featured song, in a player that repeats until the visitor stops it. */
export function OnRepeat() {
  const { youtubeId, title, featuring, eyebrow, blurb } = FEATURED_VIDEO;
  const fullTitle = featuring ? `${title} (feat. ${featuring})` : title;

  return (
    <section id="on-repeat" className="scroll-mt-20 bg-navy-950 py-8 lg:py-12">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-center lg:gap-10">
          <LoopingVideo youtubeId={youtubeId} title={fullTitle} />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-keyblue-400">
              {eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {title}
            </h2>

            {featuring ? (
              <p className="mt-1 text-sm font-semibold text-white/60">
                feat. {featuring}
              </p>
            ) : null}

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {blurb}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={youtubeWatchUrl(youtubeId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
              >
                Watch on YouTube <span aria-hidden>↗</span>
              </a>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
              >
                Subscribe <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
