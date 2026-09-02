import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { HERO, STORY_FALLBACK_HREF, STORY_VIDEO_URL } from "@/data/about";

/**
 * Hero. The team photograph carries the section; every word sits on top of it
 * as real HTML so it reflows on a phone, can be selected, and is readable by
 * Google.
 *
 * On desktop the photograph does not span the page: it occupies the right
 * side and its left edge dissolves into the same black the section sits on,
 * so the type has real darkness behind it rather than a dimmed picture. The
 * gradients are written longhand so the dissolve finishes before the headline
 * starts — a utility-scale fade cannot be positioned that precisely.
 *
 * On a phone there is no room for two columns, so the photograph goes back to
 * full width and fades upward from the bottom instead.
 */
export function AboutHero() {
  const buttonHref = STORY_VIDEO_URL ?? STORY_FALLBACK_HREF;
  const external = Boolean(STORY_VIDEO_URL);

  return (
    <section className="relative isolate flex min-h-[32rem] items-end overflow-hidden bg-navy-950 text-white lg:min-h-[40rem] lg:items-center">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 64vw"
          className="object-cover object-[62%_center] lg:object-[52%_center]"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.7)_38%,transparent_78%)] lg:bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.94)_12%,rgba(0,0,0,0.62)_28%,rgba(0,0,0,0.24)_44%,transparent_62%)]"
        />
      </div>

      <Container className="relative py-12 lg:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">
            {HERO.eyebrow}
          </p>

          <h1 className="mt-2">
            <span
              className="block text-[4.5rem] uppercase leading-[0.82] tracking-tight text-white drop-shadow-[0_3px_24px_rgba(0,0,0,0.85)] sm:text-8xl lg:text-[7.5rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {HERO.name}
            </span>
            <span
              className="mt-1 block -skew-x-12 text-3xl uppercase leading-[0.95] tracking-wide text-gold-500 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {HERO.script}
            </span>
          </h1>

          <div className="mt-6 space-y-1.5 text-base leading-snug text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] sm:text-lg">
            {HERO.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <a
            href={buttonHref}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="mt-7 inline-flex items-center gap-2.5 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold transition hover:bg-keyblue-500"
          >
            <span aria-hidden className="text-xs">
              ▶
            </span>
            Watch Our Story
          </a>
        </div>
      </Container>
    </section>
  );
}
