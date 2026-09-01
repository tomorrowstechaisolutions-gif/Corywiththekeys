import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { STORY } from "@/data/about";
import { SITE } from "@/lib/constants";

export function OurStory() {
  return (
    <section className="bg-navy-950 py-10 lg:py-14">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-navy-900 to-navy-950">
          <div className="grid gap-0 md:grid-cols-[minmax(0,20rem)_1fr]">
            <div className="relative aspect-4/3 md:aspect-auto md:min-h-[26rem]">
              <Image
                src={STORY.portrait}
                alt={STORY.portraitAlt}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover object-top"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-navy-950/70 to-transparent md:bg-linear-to-r md:from-transparent md:to-navy-950/60"
              />
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-keyblue-400">
                {STORY.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {STORY.heading}
              </h2>

              <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-white/75 sm:text-base">
                {STORY.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <p className="mt-8 font-serif text-3xl font-bold italic text-keyblue-400">
                {SITE.personality.split(" ")[0]}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
                With The Keys
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
