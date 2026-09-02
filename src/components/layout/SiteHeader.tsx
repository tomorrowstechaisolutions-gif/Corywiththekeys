import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { SiteNav } from "@/components/layout/SiteNav";
import { Container } from "@/components/ui/Container";
import { CONTACT, SITE } from "@/lib/constants";

/**
 * Public site header.
 *
 * Royal blue bar with a gold hairline along the bottom — the truck's colours
 * in the order they appear on the truck. "Get Approved" is gold because gold
 * is reserved site-wide for the one action that matters most: applying.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-gold-500/45 bg-navy-950 text-white">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          {/*
            The crossed keys sit to the left of the wordmark, and the whole
            lockup pulls back into the container's own padding so adding the
            mark does not push the name toward the nav.
          */}
          <Link
            href="/"
            aria-label={`${SITE.name} — home`}
            className="-ml-1 flex shrink-0 items-center gap-2.5 sm:-ml-2 lg:-ml-3"
          >
            <Image
              src="/brand/key-mark.png"
              alt=""
              width={512}
              height={512}
              priority
              className="h-10 w-10 shrink-0 lg:h-12 lg:w-12"
            />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-bold italic tracking-tight lg:text-2xl">
                {SITE.name}
              </span>
              <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-gold-500 lg:text-[9px]">
                {SITE.tagline}
              </span>
            </span>
          </Link>

          <SiteNav />

          <div className="flex shrink-0 items-center gap-3">
            <a
              href={CONTACT.phoneHref}
              className="hidden text-sm font-bold leading-tight sm:block"
            >
              {CONTACT.phone}
            </a>
            <Link
              href="/finance"
              className="rounded-md bg-gold-500 px-3.5 py-2 text-xs font-bold leading-tight text-navy-950 transition hover:bg-gold-400 sm:px-4 sm:text-sm"
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
