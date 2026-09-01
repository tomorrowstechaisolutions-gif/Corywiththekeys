import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHead } from "@/components/shop/Sections";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { PRODUCTS, findProduct } from "@/data/shop";
import { SITE } from "@/lib/constants";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — ${product.subtitle}`,
    description: product.description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description: product.description,
      url: `${SITE.url}/shop/${product.slug}`,
      siteName: SITE.name,
      type: "website",
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

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
