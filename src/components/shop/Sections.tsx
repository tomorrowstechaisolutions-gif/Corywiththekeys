import Image from "next/image";
import Link from "next/link";

import { ArrowRight, BENEFIT_ICONS } from "@/components/shop/icons";
import { BENEFITS, COLLECTIONS, MOVEMENT, QUOTE, REVIEWS } from "@/data/shop";

/** Section header: uppercase title left, optional link right. */
export function SectionHead({
  title,
  id,
  href,
  linkLabel,
}: {
  title: string;
  id?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div
      id={id}
      className="flex scroll-mt-24 flex-wrap items-center justify-between gap-3"
    >
      <h2 className="text-lg font-extrabold uppercase tracking-wide text-white sm:text-xl">
        {title}
      </h2>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-keyblue-400 transition hover:gap-3 hover:text-white"
        >
          {linkLabel} <ArrowRight />
        </Link>
      ) : null}
    </div>
  );
}

export function CollectionTiles() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
      <SectionHead title="Shop By Collection" />

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLLECTIONS.map((collection) => (
          <li
            key={collection.slug}
            className="group relative h-52 overflow-hidden border border-white/8 sm:h-56 lg:h-60"
          >
            <Image
              src={collection.image}
              alt={collection.alt}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,9,0.95)_6%,rgba(2,6,9,0.25)_55%,transparent)]"
            />

            <div className="absolute inset-x-0 bottom-0 p-4 text-center">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                {collection.title}
              </h3>
              <Link
                href={`/shop?collection=${collection.slug}`}
                className="mt-2.5 inline-block border border-keyblue-electric px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-electric"
              >
                Shop Now
                <span className="sr-only"> — {collection.title}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The campaign banner.
 *
 * The artwork is used as supplied on desktop, where it reads at full width.
 * That artwork carries its own lettering as pixels, and a 3:1 banner shrunk
 * to a 390px phone renders that lettering about eight pixels tall — so below
 * `lg` the same texture is used as a background and the words are set as real
 * HTML instead. Either way the alt text carries the quote, so the section is
 * never invisible to Google or a screen reader.
 */
export function QuoteBanner() {
  const quote = `${QUOTE.lines.join(" ")} ${QUOTE.emphasis.join(" ")}`;

  return (
    <section className="border-y border-white/8 bg-shop-ink">
      {/* Desktop: the banner as designed, with Cory standing in the gap. */}
      <div className="relative mx-auto hidden max-w-[2172px] lg:block">
        <Image
          src="/brand/shop/quote-banner.webp"
          alt={`“${quote}” — ${QUOTE.attribution}. ${QUOTE.headline} ${QUOTE.headlineAccent} ${QUOTE.body}`}
          width={2172}
          height={724}
          loading="lazy"
          sizes="100vw"
          className="h-auto w-full"
        />

        {/*
          Sized against the banner's own height and centred on it, so he sits
          in the empty middle the artwork leaves for him at any width. Height
          drives the size — never a fixed pixel width — so he keeps his
          proportions as the banner scales.
        */}
        <Image
          src="/brand/shop/cory-banner.webp"
          alt="Cory With The Keys"
          width={900}
          height={1320}
          loading="lazy"
          sizes="(max-width: 1536px) 34vw, 520px"
          className="absolute bottom-0 left-[54%] h-[93%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
        />
      </div>

      {/* Phone and tablet: same texture, words set as type. */}
      <div className="relative isolate overflow-hidden lg:hidden">
        <Image
          src="/brand/shop/quote-texture.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,9,0.72),rgba(2,6,9,0.86))]"
        />

        <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
          <blockquote>
            <p
              className="text-2xl uppercase leading-[1.15] text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-marker)" }}
            >
              &ldquo;{QUOTE.lines.join(" ")}{" "}
              <span className="text-keyblue-electric">
                {QUOTE.emphasis.join(" ")}
              </span>
              &rdquo;
            </p>
            <footer
              className="mt-4 text-xl text-white/80"
              style={{ fontFamily: "var(--font-signature)" }}
            >
              {QUOTE.attribution}
            </footer>
          </blockquote>

          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl">
              {QUOTE.headline}
              <br />
              <span className="text-keyblue-electric">
                {QUOTE.headlineAccent}
              </span>
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-shop-muted">
              {QUOTE.body}
            </p>
            <p
              className="mt-5 text-4xl leading-none text-keygold"
              style={{ fontFamily: "var(--font-signature)" }}
            >
              Cory
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
              With The Keys
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BenefitsRow() {
  return (
    <section className="border-b border-white/8 bg-shop-panel">
      <ul className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:gap-4 lg:px-8">
        {BENEFITS.map((benefit) => (
          <li key={benefit.key} className="flex items-start gap-3">
            <span className="shrink-0 text-keyblue-electric">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden
              >
                {BENEFIT_ICONS[benefit.key]}
              </svg>
            </span>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
                {benefit.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-shop-muted">
                {benefit.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MovementGallery() {
  if (MOVEMENT.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-keyblue-400">
        The Movement
      </h2>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {MOVEMENT.map((shot) => (
          <li
            key={shot.src}
            className="group relative h-32 overflow-hidden border border-white/8 sm:h-36 lg:h-32"
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition duration-500 group-hover:scale-110"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Reviews and the closing call to action.
 *
 * REVIEWS is empty until real ones exist — the mockup's three quotes were
 * filler with invented names on them. When the list is empty the CTA takes
 * the full width rather than leaving a hole.
 */
export function ReviewsAndCta() {
  const hasReviews = REVIEWS.length > 0;

  return (
    <section className="border-t border-white/8 bg-shop-ink">
      <div
        className={`mx-auto grid max-w-[1400px] items-stretch ${
          hasReviews ? "lg:grid-cols-[1fr_auto]" : ""
        }`}
      >
        {hasReviews ? (
          <ul className="grid gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
            {REVIEWS.map((review) => (
              <li key={review.author} className="text-center sm:text-left">
                <p
                  className="text-sm tracking-widest text-keygold"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  <span aria-hidden>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </p>
                <blockquote className="mt-2 text-xs italic leading-relaxed text-white/75">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-xs text-shop-muted">— {review.author}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 bg-keyblue-electric px-8 py-10 text-center">
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl">
            Rep The Movement.
          </h2>
          <Link
            href="/shop#featured-drops"
            className="bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-shop-panel"
          >
            Shop The Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
