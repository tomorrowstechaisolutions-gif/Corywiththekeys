import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { CONTACT, SITE, SITE_NAV } from "@/lib/constants";

/** Public site header. Dark navy bar, brand left, nav centre, CTAs right. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950 text-white">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link href="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-serif text-xl font-bold italic tracking-tight lg:text-2xl">
              {SITE.name}
            </span>
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-keyblue-400 lg:text-[9px]">
              {SITE.tagline}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-5 text-sm font-medium">
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-white/85 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href={CONTACT.phoneHref}
              className="hidden text-sm font-bold leading-tight sm:block"
            >
              {CONTACT.phone}
            </a>
            <Link
              href="/apply"
              className="rounded-md bg-keyblue-600 px-3.5 py-2 text-xs font-bold leading-tight transition hover:bg-keyblue-500 sm:px-4 sm:text-sm"
            >
              Get Approved
            </Link>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
