"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Product } from "@/data/shop";

/**
 * The published catalogue, handed down from the server.
 *
 * The cart and the header search both need to know what a slug refers to, and
 * both are client components. Rather than shipping the catalogue twice or
 * fetching it again in the browser, the shop layout loads it once on the
 * server and puts it here.
 */
const CatalogueContext = createContext<Product[]>([]);

export function CatalogueProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  return (
    <CatalogueContext.Provider value={products}>
      {children}
    </CatalogueContext.Provider>
  );
}

export function useCatalogue(): Product[] {
  return useContext(CatalogueContext);
}
