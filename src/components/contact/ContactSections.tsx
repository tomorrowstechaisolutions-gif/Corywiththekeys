import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CTA, HERO } from "@/data/contact";
import { CONTACT, HOURS, SITE_NAV, SOCIAL_LINKS } from "@/lib/constants";

/** Maps directly, so the address is never typed twice. */
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CONTACT.address.line1} ${CONTACT.address.line2}, ${CONTACT.address.city}, ${CONTACT.address.state} ${CONTACT.address.postalCode}`,
)}`;

function SocialRow({ className = "" }: { className?: string }) {
  const live = SOCIAL_LINKS.filter((s) => s.href);
  if (live.length === 0) return null;

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {live.map((social) => (
        <li key={social.label}>
          <a
            href={social.href as string}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            title={social.label}
            className="block rounded-full transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <SocialIcon name={social.icon} className="h-9 w-9" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Hero. The car sits on the right and fades into black before it reaches the
 * headline, so the type has real darkness behind it rather than a dimmed
 * photograph. On a phone there is no room for two columns, so the car drops
 * to a band beneath the copy.
 */
export function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="62vw"
          className="object-cover object-[62%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.94)_12%,rgba(0,0,0,0.55)_30%,transparent_58%)]"
        />
      </div>

      <Container className="relative py-12 lg:py-20">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold-500">
            {HERO.eyebrow}
          </p>

          <h1 className="mt-3 text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {HERO.title}{" "}
            <span className="text-keyblue-500">{HERO.titleAccent}</span>
          </h1>

          <p className="mt-4 text-base font-bold text-white sm:text-lg">
            {HERO.lead}
          </p>
          <p className="mt-1.5 text-sm text-white/70 sm:text-base">
            {HERO.body}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 rounded-md bg-keyblue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-keyblue-500"
            >
              <span aria-hidden>✆</span> Call The Key Konnect
            </a>
            <a
              href="#send-message"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              <span aria-hidden>➤</span> Send A Message
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <span aria-hidden className="text-keyblue-400">
                ✆
              </span>
              {CONTACT.phone}
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <span aria-hidden className="text-keyblue-400">
                ⚲
              </span>
              {CONTACT.address.city}, Texas
            </a>
            <SocialRow />
          </div>
        </div>
      </Container>

      {/* Phone: the car as its own band under the copy. */}
      <div className="relative h-52 w-full sm:h-64 lg:hidden">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_35%,rgba(0,0,0,0.6)_100%)]"
        />
      </div>
    </section>
  );
}

export function ContactInfoCards() {
  return (
    <Container className="pb-4">
      <ul className="grid gap-4 md:grid-cols-3">
        <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy-900/50 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-keyblue-600/15 text-xl text-keyblue-400">
            <span aria-hidden>✆</span>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Call Us
            </h3>
            <a
              href={CONTACT.phoneHref}
              className="mt-0.5 block text-lg font-bold text-keyblue-400 transition hover:text-keyblue-500"
            >
              {CONTACT.phone}
            </a>
            <p className="mt-0.5 text-xs text-white/50">
              {HOURS[0].days}: {HOURS[0].hours}
            </p>
          </div>
        </li>

        <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy-900/50 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-keyblue-600/15 text-xl text-keyblue-400">
            <span aria-hidden>⚲</span>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Visit The Key Konnect
            </h3>
            <p className="mt-0.5 text-sm text-white/75">
              {CONTACT.address.line1}, {CONTACT.address.city}{" "}
              {CONTACT.address.state}
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-500 transition hover:gap-2.5 hover:text-white"
            >
              Get Directions <span aria-hidden>→</span>
            </a>
          </div>
        </li>

        <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy-900/50 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-keyblue-600/15 text-xl text-keyblue-400">
            <span aria-hidden>♛</span>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Follow The Movement
            </h3>
            <SocialRow className="mt-2" />
          </div>
        </li>
      </ul>
    </Container>
  );
}

export function NextRideCta() {
  const inventory = SITE_NAV.find((item) => item.href === "/inventory");

  return (
    <Container className="py-8">
      <div className="relative isolate overflow-hidden rounded-xl border border-keyblue-600/40 bg-navy-950">
        <div className="absolute inset-y-0 right-0 w-[70%] sm:w-[62%]">
          <Image
            src={CTA.image}
            alt={CTA.imageAlt}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 70vw, 62vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.92)_16%,rgba(0,0,0,0.4)_40%,transparent_70%)]"
          />
        </div>

        <div className="relative max-w-lg px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-500">
            {CTA.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold uppercase leading-[0.98] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {CTA.title}
            <br />
            <span className="text-keyblue-500">{CTA.titleAccent}</span>
          </h2>
          <p className="mt-4 text-sm text-white/75 sm:text-base">{CTA.body}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={inventory?.href ?? "/inventory"}
              className="rounded-md bg-keyblue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-500"
            >
              View Inventory
            </Link>
            <Link
              href="/finance"
              className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-950 transition hover:bg-gold-400"
            >
              Get Approved
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
