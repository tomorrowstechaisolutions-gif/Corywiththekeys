"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/shop/CartProvider";
import { STORE, formatPrice, type Product } from "@/data/shop";
import { CONTACT } from "@/lib/constants";

/**
 * Product detail: gallery, variant pickers, quantity, add to cart.
 *
 * Size and colour are required before the item can be added — the buttons
 * report their state through aria-pressed so the choice is announced, and the
 * add button explains what is missing rather than silently doing nothing.
 */
export function ProductDetail({ product }: { product: Product }) {
  const { add, open } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const image = product.images[active] ?? product.images[0];
  const unavailable = product.soldOut || product.comingSoon;
  const stockNotice = product.soldOut
    ? "Sold out. Text us and we will let you know when it is back."
    : product.comingSoon
      ? "Coming soon. Text us to be told the moment it drops."
      : null;

  function handleAdd(thenOpen: boolean) {
    if (unavailable) return;
    if (product.sizes.length > 0 && !size) {
      setError("Choose a size first.");
      return;
    }
    setError(null);
    setAdding(true);
    add(product.slug, size ?? "One size", color, quantity);
    // Brief confirmation state; the drawer opens itself on add.
    window.setTimeout(() => setAdding(false), 700);
    if (thenOpen) open();
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-shop-muted">
        <Link href="/shop" className="transition hover:text-white">
          Shop
        </Link>
        <span className="px-2" aria-hidden>
          /
        </span>
        <span className="text-white/70">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square overflow-hidden border border-white/10 bg-shop-ink">
            {image ? (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-contain"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-xs font-bold uppercase tracking-wider text-white/30">
                Photo coming soon
              </span>
            )}
          </div>

          {product.images.length > 1 ? (
            <ul className="mt-3 flex gap-3">
              {product.images.map((img, index) => (
                <li key={img.src}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-current={active === index}
                    className={`relative h-20 w-20 overflow-hidden border transition ${
                      active === index
                        ? "border-keyblue-electric"
                        : "border-white/15 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-500">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-shop-muted">{product.subtitle}</p>

          <p className="mt-4 text-2xl font-bold text-white">
            {formatPrice(product.price)}
            {product.compareAt && product.compareAt > product.price ? (
              <span className="ml-2 text-base font-normal text-shop-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            ) : null}
          </p>

          {stockNotice ? (
            <p className="mt-3 inline-block border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80">
              {product.soldOut ? "Sold Out" : "Coming Soon"}
            </p>
          ) : null}

          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            {product.description}
          </p>

          <fieldset className="mt-7" hidden={product.colors.length === 0}>
            <legend className="text-[11px] font-bold uppercase tracking-wider text-white">
              Colour: <span className="text-shop-muted">{color}</span>
            </legend>
            <div className="mt-2.5 flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c.name
                      ? "border-keyblue-electric ring-2 ring-keyblue-electric/40"
                      : "border-white/25 hover:border-white/60"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6" hidden={product.sizes.length === 0}>
            <legend className="text-[11px] font-bold uppercase tracking-wider text-white">
              Size
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  aria-pressed={size === s}
                  className={`min-w-12 border px-3 py-2.5 text-xs font-bold transition ${
                    size === s
                      ? "border-keyblue-electric bg-keyblue-electric text-white"
                      : "border-white/20 text-white/80 hover:border-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-white/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3.5 py-2.5 text-white/70 transition hover:text-white"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="min-w-9 text-center text-sm font-bold text-white"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="px-3.5 py-2.5 text-white/70 transition hover:text-white"
              >
                +
              </button>
            </div>

            <p className="text-xs text-shop-muted">
              Free shipping over ${STORE.freeShippingOver}
            </p>
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-xs font-semibold text-red-400">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              className="flex-1 bg-keyblue-electric py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={adding || unavailable}
            >
              {unavailable
                ? product.soldOut
                  ? "Sold Out"
                  : "Coming Soon"
                : adding
                  ? "Added ✓"
                  : "Add To Bag"}
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              disabled={unavailable}
              className="flex-1 border border-white/30 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {stockNotice ? (
            <p className="mt-3 text-[11px] leading-relaxed text-white/45">
              {stockNotice} {CONTACT.phone}
            </p>
          ) : null}

          {!STORE.checkoutEnabled && !stockNotice ? (
            <p className="mt-3 text-[11px] leading-relaxed text-white/45">
              Online checkout opens once this drop ships. Add to the bag to hold
              your picks, then text {CONTACT.phone} to order.
            </p>
          ) : null}

          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            <details className="group py-3.5" hidden={product.details.length === 0}>
              <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wider text-white">
                Details
              </summary>
              <ul className="mt-3 space-y-1.5 text-xs text-shop-muted">
                {product.details.map((d) => (
                  <li key={d}>· {d}</li>
                ))}
              </ul>
            </details>

            <details className="group py-3.5">
              <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wider text-white">
                Sizing Guide
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-80 text-left text-xs text-shop-muted">
                  <thead>
                    <tr className="text-white/70">
                      <th scope="col" className="py-1.5 pr-4 font-semibold">
                        Size
                      </th>
                      <th scope="col" className="py-1.5 pr-4 font-semibold">
                        Chest (in)
                      </th>
                      <th scope="col" className="py-1.5 font-semibold">
                        Length (in)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["S", "34–36", "27"],
                      ["M", "38–40", "28"],
                      ["L", "42–44", "29"],
                      ["XL", "46–48", "30"],
                      ["2XL", "50–52", "31"],
                      ["3XL", "54–56", "32"],
                    ].map(([s, chest, length]) => (
                      <tr key={s} className="border-t border-white/8">
                        <td className="py-1.5 pr-4 font-semibold text-white/80">
                          {s}
                        </td>
                        <td className="py-1.5 pr-4">{chest}</td>
                        <td className="py-1.5">{length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] text-white/40">
                  Measurements are a guide. Between sizes? Size up for the
                  oversized fit in the photos.
                </p>
              </div>
            </details>

            <details className="group py-3.5">
              <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wider text-white">
                Shipping &amp; Returns
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-shop-muted">
                Ships from Killeen, Texas. Free shipping on orders over $
                {STORE.freeShippingOver}. Returns accepted within{" "}
                {STORE.returnsWindowDays} days on unworn items with tags
                attached. Questions? Call {CONTACT.phone}.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
