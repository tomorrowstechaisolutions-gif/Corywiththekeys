import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { HERO, STORY_VIDEO_URL } from "@/data/about";

/**
 * Hero. The team photograph carries the section; every word sits on top of it
 * as real HTML so it reflows on a phone, can be selected, and is readable by
 * Google.
 *
 * The gradient runs left-to-right on desktop, protecting the copy column
 * while leaving the team visible, and bottom-to-top on mobile where the crop
 * pulls the group into the middle of the frame.
 */
export function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[30rem] items-end overflow-hidden bg-black text-white lg:min-h-[36rem] lg:items-center">
      <Image
        src={HERO.image}
        alt={HERO.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] lg:object-[70%_center]"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-black/20 lg:bg-linear-to-r lg:from-black lg:via-black/70 lg:to-transparent"
      />

      <Container className="relative py-12 lg:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-keyblue-400">
            {HERO.eyebrow}
          </p>

          <h1 className="mt-3">
            <span className="block text-6xl font-extrabold uppercase leading-[0.85] tracking-tighter drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)] sm:text-7xl lg:text-8xl">
              {HERO.name}
            </span>
            <span className="mt-1 block font-serif text-3xl font-bold italic leading-tight tracking-tight text-keyblue-400 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-4xl lg:text-5xl">
              {HERO.script}
            </span>
          </h1>

          <div className="mt-5 max-w-md space-y-1 text-base leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
            {HERO.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {STORY_VIDEO_URL ? (
            <a
              href={STORY_VIDEO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold transition hover:bg-keyblue-500"
            >
              <span aria-hidden>▶</span> Watch Our Story
            </a>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
