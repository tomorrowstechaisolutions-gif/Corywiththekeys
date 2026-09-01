"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useCatalogue } from "@/components/shop/CatalogueProvider";
import type { Product } from "@/data/shop";
import {
  addLine,
  clearCart,
  closeCart,
  getServerSnapshot,
  getSnapshot,
  openCart,
  removeLine,
  setLineQuantity,
  subscribe,
  type CartLine,
} from "@/lib/cart-store";

export type CartLineView = CartLine & { product: Product; lineTotal: number };

/**
 * Reads the module-level cart store. No provider needed — every component
 * that calls this subscribes to the same state, which is what a cart wants:
 * the header badge and the drawer can never disagree.
 */
export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const catalogue = useCatalogue();

  return useMemo(() => {
    /**
     * A saved cart can outlive the product it points at — unpublished,
     * renamed, a size or colour dropped. Those lines are skipped rather than
     * priced against something that no longer exists.
     */
    const items: CartLineView[] = snapshot.lines.flatMap((line) => {
      const product = catalogue.find((p) => p.slug === line.slug);
      if (!product) return [];
      if (product.sizes.length > 0 && !product.sizes.includes(line.size)) {
        return [];
      }
      if (
        product.colors.length > 0 &&
        !product.colors.some((c) => c.name === line.color)
      ) {
        return [];
      }
      return [{ ...line, product, lineTotal: product.price * line.quantity }];
    });

    return {
      items,
      count: items.reduce((n, l) => n + l.quantity, 0),
      subtotal: items.reduce((n, l) => n + l.lineTotal, 0),
      ready: snapshot.ready,
      isOpen: snapshot.isOpen,
      open: openCart,
      close: closeCart,
      add: addLine,
      setQuantity: setLineQuantity,
      remove: removeLine,
      clear: clearCart,
    };
  }, [snapshot, catalogue]);
}
