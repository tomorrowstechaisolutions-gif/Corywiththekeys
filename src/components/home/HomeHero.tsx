import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CONTACT, SITE } from "@/lib/constants";

/**
 * Homepage hero.
 *
 * The approved comp was delivered as a flat render with the headline baked
 * into the pixels. That can't reflow, can't be selected and can't be read by
 * Google, so the photograph was cropped out of it and the type rebuilt as
 * real HTML over the top.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      {/* Desktop: photo occupies the right, gradient protects the copy. */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <Image
          src="/brand/home-hero.webp"
          alt=""
          fill
          priority
          sizes="58vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/75 to-transparent"
        />
      </div>

      <Container className="relative py-12 lg:py-24">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-gold-500 sm:text-base">
            The Official
          </p>

          <h1 className="mt-2 text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-keyblue-500">Car Plug</span>
            <span className="block">Of The People</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 lg:text-lg">
            From cash cars to near-nascars — easy financing, fast approvals, and
            a better car-buying experience.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-keyblue-600 px-6 py-3.5 text-sm font-bold transition hover:bg-keyblue-500"
            >
              View Inventory <span aria-hidden>→</span>
            </Link>
            <Link
              href="/finance"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-gold-400"
            >
              Apply Now <span aria-hidden>→</span>
            </Link>
          </div>

          <a
            href={CONTACT.phoneHref}
            className="mt-7 inline-flex items-center gap-3 transition hover:opacity-90"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-lg text-navy-950"
            >
              ✆
            </span>
            <span>
              <span className="block text-xs text-white/70">
                Call or Text {SITE.personality.split(" ")[0]}
              </span>
              <span className="block text-2xl font-extrabold leading-tight">
                {CONTACT.phone}
              </span>
            </span>
          </a>
        </div>
      </Container>

      {/* Phones and tablets: photo below the copy so it never sits under text. */}
      <div className="relative aspect-4/3 w-full sm:aspect-16/9 lg:hidden">
        <Image
          src="/brand/home-hero.webp"
          alt="Cory pointing up at The Key Konnect sign on the lot"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-navy-950 to-transparent"
        />
      </div>
    </section>
  );
}
