import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, STOCK_LABELS } from "@/lib/validation/product";

import { updateProduct } from "../actions";
import { ProductForm } from "../ProductForm";
import { PhotoManager, type PhotoItem } from "./PhotoManager";

export const metadata: Metadata = { title: "Edit product" };

const STATUS_STYLES = {
  draft: "bg-slate-200 text-slate-800",
  published: "bg-emerald-100 text-emerald-900",
  archived: "bg-slate-100 text-slate-500",
} as const;

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const profile = await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;

  const supabase = await createClient();

  const [{ data: product }, { data: imageRows }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("position"),
  ]);

  if (!product) notFound();

  const editable = canWrite(profile);

  // A picture is either in the bucket or shipped with the site — the launch
  // designs are the latter, and the table's check constraint guarantees one.
  const photos: PhotoItem[] = (imageRows ?? []).map((row) => ({
    id: row.id,
    isPrimary: row.is_primary,
    alt: row.alt ?? product.name,
    url:
      row.external_url ??
      supabase.storage.from("product-photos").getPublicUrl(row.storage_path!)
        .data.publicUrl,
  }));

  return (
    <Container className="py-8">
      <nav className="text-xs text-navy-700">
        <Link href="/admin/shop" className="hover:text-keyblue-600">
          Merch store
        </Link>
        <span className="mx-1.5">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${STATUS_STYLES[product.status]}`}
            >
              {STATUS_LABELS[product.status]}
            </span>
            <span className="text-navy-700">{STOCK_LABELS[product.stock]}</span>
            <span className="text-navy-700/60">/shop/{product.slug}</span>
          </div>
        </div>

        {product.status === "published" ? (
          <Link
            href={`/shop/${product.slug}`}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
          >
            View in store
          </Link>
        ) : null}
      </div>

      {created ? (
        <p
          role="status"
          className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Product created. Add the pictures below, then set the status to
          Published to put it in the store.
        </p>
      ) : null}

      {!editable ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You are signed in as a viewer, so this record is read-only.
        </p>
      ) : null}

      {product.photography_is_render ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This product is marked as showing a design render rather than a
          photograph of the real garment. Replace the pictures with real photos
          and clear that box before the store starts taking money for it.
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        <PhotoManager
          productId={product.id}
          photos={photos}
          canEdit={editable}
        />

        <div className="max-w-4xl">
          <ProductForm
            action={updateProduct.bind(null, product.id)}
            product={product}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </Container>
  );
}
