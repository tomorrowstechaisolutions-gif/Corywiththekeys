import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { STORY } from "@/data/about";

/**
 * The story card, with Cory cut out and standing proud of it.
 *
 * The comp has his cap breaking the top edge of the card and overlapping the
 * hero above — the effect that makes the panel feel raised off the page. That
 * needs three things working together:
 *
 *   1. a cut-out of Cory on a transparent background, so nothing rectangular
 *      covers the hero behind him;
 *   2. the card's background as its own clipped layer, so the rounded corners
 *      stay crisp while he escapes past them;
 *   3. a stacking context above the hero, via `relative z-10` on the section.
 *
 * The slats behind him are drawn in CSS rather than shipped as an image —
 * it is a repeating gradient, so it costs nothing and stays sharp at any size.
 */
export function OurStory() {
  return (
    <section
      id="our-story"
      className="relative z-10 scroll-mt-20 bg-navy-950 pb-6 pt-8 lg:pb-8 lg:pt-10"
    >
      <Container>
        <div className="relative">
          {/* The card itself: background, border and rounded corners, clipped. */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-[#071231]"
          >
            <div className="absolute inset-y-0 left-0 w-full md:w-[24rem]">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#122a63_0px,#122a63_10px,#0a1740_10px,#0a1740_26px)] opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_75%_at_25%_35%,rgba(217,169,43,0.20),transparent_65%)]" />
              <div className="absolute inset-y-0 right-0 w-24 bg-[linear-gradient(to_right,transparent,#071231)]" />
            </div>
          </div>

          <div className="relative grid md:grid-cols-[24rem_1fr]">
            {/* Portrait column. Cory is taller than the card on purpose. */}
            <div className="relative h-60 md:h-auto md:min-h-[25rem]">
              {/*
                Sized by height rather than `fill`: next/image writes
                `inset: 0` as an inline style for `fill`, which beats any
                class, so the overhang has to come from the height instead.
                Taller than its cell = the cap clears the card's top edge.
              */}
              <Image
                src={STORY.portrait}
                alt={STORY.portraitAlt}
                width={718}
                height={1000}
                priority
                sizes="(max-width: 768px) 60vw, 400px"
                className="absolute bottom-0 left-1/2 h-[calc(100%+2rem)] w-auto max-w-none -translate-x-1/2 object-contain object-bottom md:h-[calc(100%+2.5rem)]"
              />
            </div>

            <div className="p-6 pt-2 sm:p-8 sm:pt-4 md:pt-8 md:pl-8 lg:py-12 lg:pl-11 lg:pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-500">
                {STORY.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {STORY.heading}
              </h2>

              <span
                aria-hidden
                className="mt-4 block h-1 w-14 rounded-full bg-gold-500"
              />

              <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-white/75 sm:text-base">
                {STORY.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <p
                className="mt-7 text-5xl leading-none text-gold-500"
                style={{ fontFamily: "var(--font-signature)" }}
              >
                {STORY.signature}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                {STORY.signatureSub}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
