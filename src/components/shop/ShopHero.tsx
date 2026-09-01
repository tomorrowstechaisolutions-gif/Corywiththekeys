import Image from "next/image";
import Link from "next/link";

import { BENEFIT_ICONS } from "@/components/shop/icons";
import { HERO_BENEFITS } from "@/data/shop";

/**
 * Hero.
 *
 * The supplied composite is used whole — Cory, the car, the halo headlights
 * and the smoke are all one photograph, so nothing here is assembled, tinted
 * or redrawn. The shot already leaves the left third dark and empty, which is
 * exactly where the type goes.
 *
 * On desktop the photograph is the background and the copy sits over it. On a
 * phone that would put white text across his chest, so the layout flips: copy
 * first, photograph underneath it as its own block.
 */
export function ShopHero() {
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-shop-ink lg:block lg:min-h-[42rem]">
      <div className="relative order-2 h-72 w-full sm:h-96 lg:absolute lg:inset-0 lg:order-none lg:h-full">
        <Image
          src="/brand/shop/hero.webp"
          alt="Cory With The Keys in front of a black performance car with blue halo headlights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_18%] lg:object-[72%_16%]"
        />

        {/* Desktop only: protects the copy column without dimming the phone crop. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block lg:bg-[linear-gradient(to_right,#020609_4%,rgba(2,6,9,0.82)_26%,rgba(2,6,9,0.25)_46%,transparent_60%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_top,#050a0f,transparent)] lg:h-24"
        />
      </div>

      <div className="relative order-1 mx-auto w-full max-w-[1400px] px-4 pb-8 pt-12 sm:px-6 lg:order-none lg:px-8 lg:pb-24 lg:pt-24">
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
              className="border border-white/35 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10"
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
      </div>
    </section>
  );
}
