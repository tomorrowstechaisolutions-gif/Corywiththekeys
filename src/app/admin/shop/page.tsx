import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  PRODUCT_STATUS,
  STATUS_LABELS,
  STOCK_LABELS,
  type ProductStatus,
} from "@/lib/validation/product";

import { setProductStatus } from "./actions";

export const metadata: Metadata = { title: "Merch store" };

const STATUS_STYLES: Record<ProductStatus, string> = {
  draft: "bg-slate-200 text-slate-800",
  published: "bg-emerald-100 text-emerald-900",
  archived: "bg-slate-100 text-slate-500",
};

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireStaff();
  const { status, q } = await searchParams;
  const editable = canWrite(profile);

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, slug, name, category, subtitle, price, compare_at, status, stock, is_new, position, photography_is_render, updated_at, product_images(storage_path, external_url, is_primary)",
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && (PRODUCT_STATUS as readonly string[]).includes(status)) {
    query = query.eq("status", status as ProductStatus);
  }
  if (q?.trim()) {
    const term = q.trim();
    query = query.or(`name.ilike.%${term}%,subtitle.ilike.%${term}%,category.ilike.%${term}%`);
  }

  const [{ data: products, error }, { data: all }] = await Promise.all([
    query,
    supabase.from("products").select("status, photography_is_render"),
  ]);

  const counts = new Map<string, number>();
  for (const row of all ?? []) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  const rendersRemaining = (all ?? []).filter(
    (row) => row.photography_is_render,
  ).length;

  const filters = [
    { label: "All", value: undefined, count: all?.length ?? 0 },
    ...PRODUCT_STATUS.map((value) => ({
      label: STATUS_LABELS[value],
      value,
      count: counts.get(value) ?? 0,
    })),
  ];

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Merch store</h1>
          <p className="mt-1 text-sm text-navy-700">
            {all?.length ?? 0} product{all?.length === 1 ? "" : "s"} · pictures,
            prices, sizes and colours
          </p>
        </div>

        {editable ? (
          <Link
            href="/admin/shop/new"
            className="rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500"
          >
            Add product
          </Link>
        ) : null}
      </div>

      {rendersRemaining > 0 ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {rendersRemaining} product{rendersRemaining === 1 ? " is" : "s are"}{" "}
          still shown with design renders rather than photographs of the real
          garment. Checkout stays switched off until every one has a real photo
          and the “Images are mockup renders” box is cleared.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const active = (status ?? undefined) === filter.value;
          const href = filter.value
            ? `/admin/shop?status=${filter.value}`
            : "/admin/shop";

          return (
            <Link
              key={filter.label}
              href={href}
              className={
                active
                  ? "rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-navy-700 hover:border-keyblue-500"
              }
            >
              {filter.label}
              <span className="ml-1.5 opacity-60">{filter.count}</span>
            </Link>
          );
        })}
      </div>

      <form className="mt-4 flex gap-2" action="/admin/shop">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search products"
          className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load the store.
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wider text-navy-700">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Pictures</th>
              {editable ? <th className="px-4 py-3 font-semibold">Publish</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(products ?? []).map((product) => {
              const images = product.product_images ?? [];
              const main =
                images.find((image) => image.is_primary) ?? images[0] ?? null;
              const thumb = main
                ? (main.external_url ??
                  supabase.storage
                    .from("product-photos")
                    .getPublicUrl(main.storage_path!).data.publicUrl)
                : null;

              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[10px] font-semibold text-slate-400">
                            None
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/admin/shop/${product.id}`}
                          className="font-semibold text-navy-900 hover:text-keyblue-600"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-navy-700">
                          <span>{product.subtitle ?? product.category}</span>
                          {product.is_new ? (
                            <span className="rounded bg-keyblue-600/10 px-1.5 py-0.5 font-semibold text-keyblue-700">
                              New
                            </span>
                          ) : null}
                          {product.photography_is_render ? (
                            <span
                              className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900"
                              title="Still using the design render, not a photo of the real garment"
                            >
                              Render
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-navy-900">
                    {formatCurrency(Number(product.price))}
                    {product.compare_at ? (
                      <span className="ml-1.5 text-xs font-normal text-navy-700/70 line-through">
                        {formatCurrency(Number(product.compare_at))}
                      </span>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[product.status]}`}
                    >
                      {STATUS_LABELS[product.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-navy-700">
                    {STOCK_LABELS[product.stock]}
                  </td>

                  <td className="px-4 py-3 text-navy-700">
                    {images.length === 0 ? (
                      <span className="text-amber-700">None</span>
                    ) : (
                      images.length
                    )}
                  </td>

                  {editable ? (
                    <td className="px-4 py-3">
                      <form
                        action={setProductStatus.bind(
                          null,
                          product.id,
                          product.status === "published" ? "draft" : "published",
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-slate-50"
                        >
                          {product.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              );
            })}

            {(products ?? []).length === 0 ? (
              <tr>
                <td colSpan={editable ? 6 : 5} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-navy-900">
                    No products here yet.
                  </p>
                  <p className="mt-1 text-sm text-navy-700">
                    {q || status
                      ? "Try clearing the filters."
                      : "Add the first one to start filling the store."}
                  </p>
                  {editable && !q && !status ? (
                    <Link
                      href="/admin/shop/new"
                      className="mt-4 inline-block rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-keyblue-500"
                    >
                      Add product
                    </Link>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
