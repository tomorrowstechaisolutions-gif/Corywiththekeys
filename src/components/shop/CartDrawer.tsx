"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { useCart } from "@/components/shop/CartProvider";
import { CloseIcon } from "@/components/shop/icons";
import { STORE, formatPrice } from "@/data/shop";
import { CONTACT } from "@/lib/constants";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, count, setQuantity, remove } =
    useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the drawer while it is open.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const remaining = STORE.freeShippingOver - subtotal;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-shop-panel shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Your Bag{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="p-1.5 text-white/70 transition hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-base font-bold text-white">Your bag is empty.</p>
            <p className="text-sm text-shop-muted">
              Nothing in here yet. The drops are waiting.
            </p>
            <Link
              href="/shop#featured-drops"
              onClick={close}
              className="mt-2 bg-keyblue-electric px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-600"
            >
              Shop The Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/8 overflow-y-auto">
              {items.map((line) => (
                <li key={line.id} className="flex gap-3 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-white/10 bg-black/40">
                    <Image
                      src={line.product.images[0].src}
                      alt={line.product.images[0].alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      {line.product.name}
                    </p>
                    <p className="text-xs text-shop-muted">
                      {line.color} · {line.size}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-white/20">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.product.name}`}
                          className="px-2.5 py-1 text-white/70 transition hover:text-white"
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold text-white">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.id, line.quantity + 1)}
                          aria-label={`Increase quantity of ${line.product.name}`}
                          className="px-2.5 py-1 text-white/70 transition hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="text-[11px] uppercase tracking-wide text-white/45 underline-offset-2 transition hover:text-white hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-white">
                    {formatPrice(line.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 p-5">
              {remaining > 0 ? (
                <p className="mb-3 text-xs text-shop-muted">
                  {formatPrice(remaining)} away from free shipping.
                </p>
              ) : (
                <p className="mb-3 text-xs font-semibold text-keygold">
                  Free shipping unlocked.
                </p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-wide text-white/70">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-white/40">
                Shipping and tax calculated at checkout.
              </p>

              {STORE.checkoutEnabled ? (
                <Link
                  href="/shop/checkout"
                  onClick={close}
                  className="mt-4 block bg-keyblue-electric py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-600"
                >
                  Checkout
                </Link>
              ) : (
                <div className="mt-4">
                  <a
                    href={`sms:${CONTACT.phoneHref.replace("tel:", "")}`}
                    className="block bg-keyblue-electric py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-600"
                  >
                    Text Cory To Order
                  </a>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-white/45">
                    Online checkout opens once the drop ships. Text{" "}
                    {CONTACT.phone} with your size and colour and Cory will sort
                    you out.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
