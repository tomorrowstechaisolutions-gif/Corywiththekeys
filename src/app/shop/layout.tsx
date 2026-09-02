import type { ReactNode } from "react";

import { CartDrawer } from "@/components/shop/CartDrawer";
import { CatalogueProvider } from "@/components/shop/CatalogueProvider";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSettings } from "@/lib/settings";
import { getStoreProducts } from "@/lib/shop-catalogue";

/**
 * The store runs on its own chrome rather than the dealership header — it is
 * a different shop with a different nav, cart and palette, and mixing the two
 * would leave visitors unsure which site they are on.
 *
 * The catalogue is loaded once here and handed to the client through
 * CatalogueProvider: the header search and the cart both need it, and neither
 * should fetch it again. The cart itself is still a module-level store read
 * through useSyncExternalStore, so there is no cart provider to wrap.
 */
export default async function ShopLayout({ children }: { children: ReactNode }) {
  const [products, settings] = await Promise.all([
    getStoreProducts(),
    getSettings(),
  ]);

  return (
    <CatalogueProvider products={products}>
      <SettingsProvider value={settings}>
        <div className="flex min-h-dvh flex-col bg-shop-bg text-white">
          <ShopHeader />
          <main className="flex-1">{children}</main>
          <ShopFooter settings={settings} />
          <CartDrawer />
        </div>
      </SettingsProvider>
    </CatalogueProvider>
  );
}
