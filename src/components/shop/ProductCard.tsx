"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/shop/CartProvider";
import { formatPrice, type Product } from "@/data/shop";

/**
 * Product tile. Hover lifts the card and reveals quick-shop: pick a size
 * inline and the item goes straight to the cart without leaving the grid.
 * Keyboard users get the same panel via focus-within, so it is not a
 * mouse-only feature.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");

  // A product can be published before its photography arrives, and it can be
  // out of stock. Neither should render a broken tile or a live buy button.
  const image = product.images[0];
  const unavailable = product.soldOut || product.comingSoon;
  const stockLabel = product.soldOut
    ? "Sold Out"
    : product.comingSoon
      ? "Coming Soon"
      : null;

  return (
    <article className="group relative flex h-full flex-col border border-white/8 bg-shop-panel transition duration-300 focus-within:-translate-y-1 focus-within:border-white/20 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_40px_-18px_rgba(10,102,255,0.55)]">
      <div className="relative aspect-4/3 overflow-hidden bg-[#0a0e11]">
        <Link href={`/shop/${product.slug}`} className="block h-full w-full">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-[10px] font-bold uppercase tracking-wider text-white/30">
              Photo coming soon
            </span>
          )}
          <span className="sr-only">View {product.name}</span>
        </Link>

        {product.isNew && !stockLabel ? (
          <span className="pointer-events-none absolute left-3 top-3 bg-keyblue-electric px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        ) : null}

        {stockLabel ? (
          <span className="pointer-events-none absolute left-3 top-3 bg-black/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {stockLabel}
          </span>
        ) : null}

        {/* Quick shop — hidden entirely on anything that cannot be bought. */}
        <div hidden={unavailable || product.sizes.length === 0} className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-black/85 p-3 opacity-0 backdrop-blur-sm transition duration-300 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
            Quick add
          </p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => add(product.slug, size, color)}
                className="min-w-9 border border-white/25 px-2 py-1.5 text-[11px] font-bold text-white transition hover:border-keyblue-electric hover:bg-keyblue-electric"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-keyblue-400">
          {product.category}
        </p>
        <h3 className="mt-1.5 text-sm font-bold uppercase tracking-wide text-white">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-shop-muted">{product.subtitle}</p>
        <p className="mt-2 text-sm font-bold text-white">
          {formatPrice(product.price)}
          {product.compareAt && product.compareAt > product.price ? (
            <span className="ml-2 text-xs font-normal text-shop-muted line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </p>

        <div className="relative z-10 mt-3 flex gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-label={`${c.name}${color === c.name ? " (selected)" : ""}`}
              aria-pressed={color === c.name}
              className={`h-4 w-4 rounded-full border transition ${
                color === c.name
                  ? "border-white ring-2 ring-keyblue-electric ring-offset-1 ring-offset-shop-panel"
                  : "border-white/35 hover:border-white"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
