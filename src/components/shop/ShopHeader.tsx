"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/shop/CartProvider";
import { useCatalogue } from "@/components/shop/CatalogueProvider";
import {
  AccountIcon,
  BagIcon,
  ChevronDown,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/shop/icons";
import { COLLECTIONS } from "@/data/shop";
import { SITE } from "@/lib/constants";

/**
 * "Home" is the dealership site, not the store front page — the store is a
 * section of thekeykonnect.com, not a separate destination, and a visitor who
 * came for merch still needs a way back to the cars.
 */
const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Drops", href: "/shop?filter=new" },
  { label: "Tees", href: "/shop?filter=tees" },
  { label: "Hoodies", href: "/shop?filter=hoodies" },
  { label: "Accessories", href: "/shop?filter=accessories" },
  { label: "About", href: "/about" },
];

/** Crossed keys — the brand mark, drawn rather than shipped as an image. */
function KeyMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 text-keygold" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M7 25 21 11" />
        <circle cx="23.5" cy="8.5" r="3.2" />
        <path d="M17 15l2.5 2.5M14 18l2 2" />
        <path d="M25 25 11 11" />
        <circle cx="8.5" cy="8.5" r="3.2" />
        <path d="M15 15l-2.5 2.5M18 18l-2 2" />
      </g>
    </svg>
  );
}

export function ShopHeader() {
  const { count, open, ready } = useCart();
  const catalogue = useCatalogue();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close the mobile menu when the route changes, without a state-in-effect.
  if (menuOpen && openedOn !== pathname) {
    setMenuOpen(false);
    setOpenedOn(pathname);
  }

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = query.trim()
    ? catalogue.filter((p) =>
        `${p.name} ${p.subtitle} ${p.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-shop-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <KeyMark />
          <span className="leading-none">
            <span className="block font-serif text-lg font-bold italic tracking-tight text-white lg:text-xl">
              {SITE.name}
            </span>
            <span className="mt-1 hidden text-[8px] font-semibold uppercase tracking-[0.14em] text-keyblue-500 sm:block">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Shop"
          className="ml-auto hidden items-center gap-6 xl:flex"
        >
          <Link
            href="/"
            className="text-[13px] font-semibold uppercase tracking-wide text-white/70 transition hover:text-white"
          >
            Home
          </Link>

          <div className="group relative">
            <Link
              href="/shop"
              className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide transition ${
                pathname === "/shop" ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Shop <ChevronDown />
            </Link>
            <div className="invisible absolute left-0 top-full z-10 w-56 border border-white/10 bg-shop-panel p-2 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?collection=${c.slug}`}
                  className="block px-3 py-2 text-[13px] font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>

          {NAV.slice(2).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] font-semibold uppercase tracking-wide text-white/70 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-6">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search products"
            aria-expanded={searchOpen}
            className="p-2 text-white/80 transition hover:text-white"
          >
            <SearchIcon />
          </button>

          <Link
            href="/contact"
            aria-label="Account and support"
            className="hidden p-2 text-white/80 transition hover:text-white sm:block"
          >
            <AccountIcon />
          </Link>

          <button
            type="button"
            onClick={open}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative p-2 text-white/80 transition hover:text-white"
          >
            <BagIcon />
            <span
              className={`absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-keyblue-600 px-1 text-[10px] font-bold text-white transition ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="p-2 text-white/80 transition hover:text-white xl:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-white/8 bg-shop-panel">
          <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hoodies, tees, collections…"
              className="w-full border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-keyblue-500 focus:outline-none"
            />

            {query.trim() ? (
              <ul className="mt-3 divide-y divide-white/8 border border-white/10">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-white/50">
                    Nothing matches “{query.trim()}”.
                  </li>
                ) : (
                  results.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/shop/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/5"
                      >
                        <span className="text-sm font-semibold text-white">
                          {p.name}
                          <span className="ml-2 font-normal text-white/50">
                            {p.subtitle}
                          </span>
                        </span>
                        <span className="text-sm text-keyblue-400">
                          ${p.price.toFixed(2)}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <nav
          aria-label="Shop, mobile"
          className="border-t border-white/8 bg-shop-panel xl:hidden"
        >
          <ul className="mx-auto max-w-[1400px] px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-wide text-white/80"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?collection=${c.slug}`}
                  className="block border-b border-white/5 py-3 pl-4 text-sm text-white/60"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
