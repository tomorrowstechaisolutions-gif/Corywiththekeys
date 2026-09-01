import { MusicHeroMedia } from "@/components/music/MusicHero";
import { Container } from "@/components/ui/Container";
import { LINKTREE_URL } from "@/data/cory-links";

/**
 * Hero. Copy left, Cory centre-right, car far right — all real HTML over the
 * photograph, never baked into it.
 *
 * The gradient is horizontal on desktop (protecting the left column) and
 * vertical on mobile (protecting the bottom), because on a narrow screen the
 * crop pushes Cory into the middle and a left-to-right fade would sit
 * straight across his face.
 */
export function MusicHeroSection() {
  return (
    <section className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-black text-white lg:min-h-[40rem] lg:items-center">
      <div className="absolute inset-0">
        <MusicHeroMedia />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-black/10 lg:bg-linear-to-r lg:from-black lg:via-black/80 lg:to-transparent"
      />

      <Container className="relative py-12 lg:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-keyblue-400">
            Official Music
          </p>

          <h1 className="mt-3">
            <span className="block text-6xl font-extrabold leading-[0.85] tracking-tighter text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-7xl lg:text-8xl">
              Cory
            </span>
            <span className="mt-1 block font-serif text-3xl font-bold italic leading-tight tracking-tight text-keyblue-400 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-4xl lg:text-5xl">
              With The Keys
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
            I am changing the world one song and Car at a time.
            <span className="mt-1 block font-semibold text-keyblue-400">
              I AM Cory with the Keys.
            </span>
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#new-release"
              className="inline-flex items-center gap-2 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold transition hover:bg-keyblue-500"
            >
              Listen Now <span aria-hidden>♪</span>
            </a>
            <a
              href="#music-videos"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-black/30 px-5 py-3 text-sm font-bold backdrop-blur-sm transition hover:border-white hover:bg-white/10"
            >
              Watch Videos <span aria-hidden>▷</span>
            </a>
            <a
              href={LINKTREE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-black/30 px-5 py-3 text-sm font-bold backdrop-blur-sm transition hover:border-white hover:bg-white/10"
            >
              Follow Cory <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
