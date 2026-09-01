import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CONTACT, SITE, SITE_NAV } from "@/lib/constants";

/** Public site header. Structure only — visual design comes later. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">{SITE.name}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {SITE.tagline}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6 text-sm font-medium">
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-keyblue-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={CONTACT.phoneHref}
              className="hidden text-sm font-semibold sm:inline"
            >
              {CONTACT.phone}
            </a>
            <Link
              href="/apply"
              className="rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold hover:bg-keyblue-500"
            >
              Get Approved
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
