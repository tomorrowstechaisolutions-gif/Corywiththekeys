import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHead } from "@/components/shop/Sections";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { SITE } from "@/lib/constants";
import { getStoreProduct, getStoreProducts } from "@/lib/shop-catalogue";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) return { title: "Product not found" };

  const image = product.images[0];

  return {
    title: product.subtitle
      ? `${product.name} — ${product.subtitle}`
      : product.name,
    description: product.description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description: product.description,
      url: `${SITE.url}/shop/${product.slug}`,
      siteName: SITE.name,
      type: "website",
      images: image ? [{ url: image.src, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, all] = await Promise.all([
    getStoreProduct(slug),
    getStoreProducts(),
  ]);
  if (!product) notFound();

  const related = all.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      <ProductDetail product={product} />

      {related.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-8">
          <SectionHead title="You Might Also Like" />
          <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug} className="h-full">
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
