import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { STORY } from "@/data/about";

export function OurStory() {
  return (
    <section id="our-story" className="scroll-mt-20 bg-navy-950 pb-6 pt-8 lg:pb-8 lg:pt-10">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#060d1c]">
          <div className="grid md:grid-cols-[minmax(0,22rem)_1fr]">
            <div className="relative h-72 md:h-auto md:min-h-[24rem]">
              <Image
                src={STORY.portrait}
                alt={STORY.portraitAlt}
                fill
                sizes="(max-width: 768px) 100vw, 352px"
                className="object-cover object-top"
              />
              {/* Blends the cut-out portrait into the card on desktop. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,#060d1c_0%,transparent_35%)] md:bg-[linear-gradient(to_right,transparent_55%,#060d1c_100%)]"
              />
            </div>

            <div className="p-6 sm:p-8 lg:py-12 lg:pl-4 lg:pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-keyblue-400">
                {STORY.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {STORY.heading}
              </h2>

              <span
                aria-hidden
                className="mt-4 block h-0.5 w-14 rounded-full bg-keyblue-500"
              />

              <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-white/75 sm:text-base">
                {STORY.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <p
                className="mt-7 text-5xl leading-none text-keyblue-500"
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
