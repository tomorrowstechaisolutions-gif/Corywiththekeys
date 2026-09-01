import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";

/**
 * Inventory hero.
 *
 * Two layouts rather than one that compromises: on large screens the car sits
 * behind the copy with a gradient protecting the text, and on phones the copy
 * gets solid navy with the car in a band beneath it. Overlaying text on a
 * photo at 390px wide is where dealership sites usually become unreadable.
 */
export function InventoryHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      {/* Desktop: photo bleeds off the right. */}
      <div className="absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        <Image
          src="/brand/inventory-hero.webp"
          alt=""
          fill
          priority
          sizes="62vw"
          className="object-cover object-left"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/70 to-transparent"
        />
      </div>

      <Container className="relative py-10 lg:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-keyblue-400">
            Inventory
          </p>

          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Next Ride
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 lg:text-lg">
            Cars, trucks, SUVs and more — updated as inventory becomes
            available.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/finance"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-keyblue-600 px-6 py-3.5 text-sm font-bold transition hover:bg-keyblue-500"
            >
              Get Pre-Approved <span aria-hidden>→</span>
            </Link>
            <Link
              href="/trade-in"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 px-6 py-3.5 text-sm font-bold transition hover:border-white hover:bg-white/10"
            >
              Trade In Your Vehicle <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Container>

      {/* Mobile and tablet: photo below the copy, never behind it. */}
      <div className="relative aspect-16/7 w-full lg:hidden">
        <Image
          src="/brand/inventory-hero.webp"
          alt="A dark sedan on a city forecourt at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-navy-950 to-transparent"
        />
      </div>
    </section>
  );
}
