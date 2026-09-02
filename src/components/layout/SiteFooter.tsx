import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CONTACT, HOURS, SITE, SITE_NAV, SOCIAL_LINKS } from "@/lib/constants";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [
    CONTACT.address.line1,
    CONTACT.address.line2,
    `${CONTACT.address.city}, ${CONTACT.address.state} ${CONTACT.address.postalCode}`,
  ].join(", "),
)}`;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 border-gold-500/45 bg-navy-950 text-white">
      <Container className="py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/key-mark.png"
                alt=""
                width={512}
                height={512}
                loading="lazy"
                className="h-11 w-11 shrink-0"
              />
              <p className="font-serif text-xl font-bold italic">{SITE.name}</p>
            </div>
            <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-500">
              {SITE.tagline}
            </p>
            <p className="mt-4 text-sm text-white/70">
              The Official Car Plug of the People.
            </p>

            <ul className="mt-5 flex gap-3">
              {SOCIAL_LINKS.filter((social) => social.href).map((social) => (
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
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <a href={CONTACT.phoneHref} className="hover:text-white">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
              <li>{SITE.domain}</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">Location</p>
            <address className="mt-4 space-y-1 text-sm not-italic text-white/75">
              <p>{CONTACT.address.line1}</p>
              <p>{CONTACT.address.line2}</p>
              <p>
                {CONTACT.address.city}, {CONTACT.address.state}{" "}
                {CONTACT.address.postalCode}
              </p>
            </address>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-keyblue-600 px-3 py-1.5 text-xs font-bold transition hover:bg-keyblue-500"
            >
              Get Directions <span aria-hidden>→</span>
            </a>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">Hours</p>
            <dl className="mt-4 space-y-2 text-sm text-white/75">
              {HOURS.map((entry) => (
                <div key={entry.days} className="flex justify-between gap-3">
                  <dt>{entry.days}</dt>
                  <dd className="text-right text-white/90">{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <nav aria-label="Footer" className="mt-10 border-t border-white/10 pt-6">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-center text-xs text-white/50">
          &copy; {year} {SITE.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
