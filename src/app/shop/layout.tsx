import type { ReactNode } from "react";

import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { ShopHeader } from "@/components/shop/ShopHeader";

/**
 * The store runs on its own chrome rather than the dealership header — it is
 * a different shop with a different nav, cart and palette, and mixing the two
 * would leave visitors unsure which site they are on.
 *
 * No cart provider: the cart is a module-level store read through
 * useSyncExternalStore, so there is nothing to wrap.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-shop-bg text-white">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
      <CartDrawer />
    </div>
  );
}
