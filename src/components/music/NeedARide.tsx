import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";

/** Cross-sell back into inventory — the music brings them, the cars pay. */
export function NeedARide() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      <Image
        src="/brand/inventory-hero.webp"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-[70%_center] opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent"
      />

      <Container className="relative py-12 lg:py-16">
        <div className="max-w-lg">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            Need a ride too?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            Shop The Key Konnect inventory and let Cory get you rolling.
          </p>
          <Link
            href="/inventory"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-keyblue-600 px-6 py-3 text-sm font-bold transition hover:bg-keyblue-500"
          >
            View Inventory <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
