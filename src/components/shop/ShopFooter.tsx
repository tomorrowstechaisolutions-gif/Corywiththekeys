import Image from "next/image";
import Link from "next/link";

import { COLLECTIONS, STORE } from "@/data/shop";
import { CONTACT, SITE } from "@/lib/constants";

export function ShopFooter() {
  return (
    <footer className="border-t border-white/8 bg-shop-ink">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/key-mark.png"
              alt=""
              width={512}
              height={512}
              loading="lazy"
              className="h-9 w-9 shrink-0"
            />
            <p className="font-serif text-lg font-bold italic text-white">
              {SITE.name}
            </p>
          </div>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-keyblue-500">
            {SITE.tagline}
          </p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-shop-muted">
            Official merch from {SITE.personality}. Built on hustle, worn by the
            movement.
          </p>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
            Shop
          </h2>
          <ul className="mt-3 space-y-2">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?collection=${c.slug}`}
                  className="text-xs text-shop-muted transition hover:text-white"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
            Help
          </h2>
          <ul className="mt-3 space-y-2 text-xs text-shop-muted">
            <li>Free shipping over ${STORE.freeShippingOver}</li>
            <li>{STORE.returnsWindowDays}-day returns</li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/inventory" className="transition hover:text-white">
                Shop cars instead
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
            Contact
          </h2>
          <ul className="mt-3 space-y-2 text-xs text-shop-muted">
            <li>
              <a
                href={CONTACT.phoneHref}
                className="transition hover:text-white"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition hover:text-white"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="pt-1 leading-relaxed">
              {CONTACT.address.line1}
              <br />
              {CONTACT.address.city}, {CONTACT.address.state}{" "}
              {CONTACT.address.postalCode}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8 py-4 text-center text-[11px] text-white/35">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
