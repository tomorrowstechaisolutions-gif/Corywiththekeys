import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return (
    <PagePlaceholder
      eyebrow="Shop"
      title="Shop"
      description="Route placeholder for branded merchandise. Commerce provider is not selected yet."
      scope={[
        "Product grid and detail views",
        "Cart and checkout",
        "Order confirmation",
      ]}
    />
  );
}
