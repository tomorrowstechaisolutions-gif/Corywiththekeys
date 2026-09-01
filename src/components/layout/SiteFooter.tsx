import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CONTACT, HOURS, SITE, SITE_NAV } from "@/lib/constants";

/** Public site footer. Structure only — visual design comes later. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy-950 text-white">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold">{SITE.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
              {SITE.tagline}
            </p>
            <p className="mt-4 text-sm text-muted">
              The Official Car Plug of the People.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>{SITE.domain}</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Location
            </p>
            <address className="mt-3 space-y-1 text-sm not-italic text-muted">
              <p>{CONTACT.address.line1}</p>
              <p>{CONTACT.address.line2}</p>
              <p>
                {CONTACT.address.city}, {CONTACT.address.state}{" "}
                {CONTACT.address.postalCode}
              </p>
            </address>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Hours
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {HOURS.map((entry) => (
                <li key={entry.days}>
                  {entry.days}: {entry.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Footer" className="mt-10 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-xs text-muted">
          &copy; {year} {SITE.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
