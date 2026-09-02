import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/shop/ProductCard";
import {
  BenefitsRow,
  CollectionTiles,
  MovementGallery,
  QuoteBanner,
  ReviewsAndCta,
  SectionHead,
} from "@/components/shop/Sections";
import { ShopHero } from "@/components/shop/ShopHero";
import { COLLECTIONS, type Product } from "@/data/shop";
import { SITE } from "@/lib/constants";
import { getStoreProducts } from "@/lib/shop-catalogue";

const DESCRIPTION =
  "Official Cory With The Keys merch. Keys 2 Success hoodies, statement tees and the Hustle collection — built for people who refuse to quit.";

export const metadata: Metadata = {
  title: "Keys 2 Success — Official Merch",
  description: DESCRIPTION,
  alternates: { canonical: "/shop" },
  openGraph: {
    title: `Keys 2 Success — Official Merch | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/shop`,
    siteName: SITE.name,
    type: "website",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Category filters map onto the catalogue without a separate taxonomy. */
function applyFilter(
  all: Product[],
  filter: string | undefined,
  collection: string | undefined,
) {
  let list = all;

  if (collection) {
    list = list.filter((p) => p.collection === collection);
  }

  switch (filter) {
    case "new":
      return list.filter((p) => p.isNew);
    case "hoodies":
      return list.filter((p) =>
        /hoodie|crewneck/i.test(`${p.subtitle} ${p.name}`),
      );
    case "tees":
      return list.filter((p) => /tee|shirt/i.test(p.subtitle));
    case "accessories":
      return list.filter((p) => /hat|cap|chain|accessor/i.test(p.subtitle));
    default:
      return list;
  }
}

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "new", label: "New Drops" },
  { key: "hoodies", label: "Hoodies" },
  { key: "tees", label: "Tees" },
  { key: "accessories", label: "Accessories" },
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : undefined;
  const collection =
    typeof params.collection === "string" ? params.collection : undefined;

  const products = applyFilter(await getStoreProducts(), filter, collection);
  const activeCollection = COLLECTIONS.find((c) => c.slug === collection);
  const filtered = Boolean(filter || collection);

  return (
    <>
      <ShopHero />

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <SectionHead
          id="featured-drops"
          title={activeCollection ? activeCollection.title : "Featured Drops"}
          href={filtered ? "/shop" : undefined}
          linkLabel={filtered ? "Clear filters" : undefined}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key && !collection;
            const href = f.key ? `/shop?filter=${f.key}` : "/shop";
            return (
              <Link
                key={f.label}
                href={href}
                aria-current={active ? "true" : undefined}
                className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                  active
                    ? "border-keyblue-electric bg-keyblue-electric text-white"
                    : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="mt-8 border border-white/10 bg-shop-panel px-6 py-14 text-center">
            <p className="text-base font-bold text-white">
              Nothing in this category yet.
            </p>
            <p className="mt-2 text-sm text-shop-muted">
              More drops are on the way. Check the full collection in the
              meantime.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-block bg-keyblue-electric px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-keyblue-600"
            >
              View Everything
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <li key={product.slug} className="h-full">
                <ProductCard product={product} priority={index < 2} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CollectionTiles />
      <QuoteBanner />
      <BenefitsRow />
      <MovementGallery />
      <ReviewsAndCta />
    </>
  );
}
