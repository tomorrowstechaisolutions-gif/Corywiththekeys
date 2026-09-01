import Image from "next/image";
import Link from "next/link";

import { BENEFIT_ICONS } from "@/components/shop/icons";
import { HERO_BENEFITS } from "@/data/shop";

/**
 * Hero: type on the left, Cory on the right against the car.
 *
 * The automotive scene is assembled from real assets rather than a generated
 * composite — the car and its blue headlights are a crop of the stage
 * photograph, Cory is the transparent cut-out of the actual photo, and the
 * haze and rim light are CSS gradients layered between them. Nothing about
 * him is redrawn.
 */
export function ShopHero() {
  return (
    <section className="relative isolate overflow-hidden bg-shop-ink">
      {/* Car, headlights and haze. */}
      <div aria-hidden className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <Image
          src="/brand/shop/hero-car.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="object-cover object-[78%_center] opacity-80"
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_62%_46%,rgba(10,102,255,0.28),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#020609_0%,rgba(2,6,9,0.8)_22%,transparent_52%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,#020609,transparent)]" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-8 px-4 pb-10 pt-12 sm:px-6 lg:grid-cols-[1fr_46%] lg:gap-4 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-keyblue-electric">
            Official Merch
          </p>

          <h1 className="mt-3">
            <span
              className="block text-[3.75rem] uppercase leading-[0.84] tracking-tight text-[#F5F5F5] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)] sm:text-8xl lg:text-[7rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Keys 2
            </span>
            <span
              className="mt-1 block -skew-x-12 text-[3.25rem] uppercase leading-[0.9] tracking-wide text-keyblue-electric drop-shadow-[0_2px_22px_rgba(10,102,255,0.45)] sm:text-7xl lg:text-[6rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Success
            </span>
          </h1>

          <p className="mt-5 text-base text-white/85 sm:text-lg">
            Built for people who refuse to quit.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#featured-drops"
              className="bg-keyblue-electric px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#3a84ff]"
            >
              Shop The Collection
            </Link>
            <Link
              href="/shop?filter=new"
              className="border border-white/35 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10"
            >
              New Drops
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-x-3 gap-y-5 sm:flex sm:flex-nowrap sm:items-center sm:gap-0">
            {HERO_BENEFITS.map((benefit, index) => (
              <li
                key={benefit.key}
                className={`flex items-center gap-2 sm:pl-3 sm:pr-3.5 ${
                  index > 0 ? "sm:border-l sm:border-white/12" : ""
                } ${index === 0 ? "sm:pl-0" : ""}`}
              >
                <span className="shrink-0 text-keygold">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    {BENEFIT_ICONS[benefit.key]}
                  </svg>
                </span>
                <span className="text-[9px] font-bold uppercase leading-tight tracking-wide text-white/85">
                  {benefit.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cory. The real photograph, cut out — never redrawn. */}
        <div className="relative -mb-10 h-72 sm:h-96 lg:mb-0 lg:h-auto lg:min-h-[30rem]">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 top-1/4 bg-[radial-gradient(50%_50%_at_50%_60%,rgba(10,102,255,0.22),transparent_72%)]"
          />
          <Image
            src="/brand/about/cory-cutout.webp"
            alt="Cory With The Keys wearing the Cory With The Keys tee and cap"
            width={718}
            height={1000}
            priority
            sizes="(max-width: 1024px) 70vw, 620px"
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[0_0_40px_rgba(10,102,255,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}
