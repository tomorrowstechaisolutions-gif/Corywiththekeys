import "server-only";

import type { ColorOption, Product, ProductImage } from "@/data/shop";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];

const BUCKET = "product-photos";

const SELECT =
  "id, slug, name, category, subtitle, description, details, price, compare_at, collection, sizes, colors, is_new, status, stock, position, photography_is_render, product_images(id, storage_path, external_url, alt, position, is_primary)";

type Row = ProductRow & {
  product_images: Pick<
    ImageRow,
    "id" | "storage_path" | "external_url" | "alt" | "position" | "is_primary"
  >[];
};

/**
 * `colors` is jsonb. This form writes it and nothing else does, but a row that
 * somehow holds the wrong shape should lose its swatches, not break the store.
 */
function readColors(value: ProductRow["colors"]): ColorOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.name !== "string") return [];
    return [
      {
        name: record.name,
        hex: typeof record.hex === "string" ? record.hex : "#8b8b8b",
      },
    ];
  });
}

/**
 * Database row to the shape the store components already speak.
 *
 * The main picture comes first, then the rest in their set order — the grid
 * card shows images[0], so "set as main" in the admin has to land here.
 */
function toProduct(
  row: Row,
  publicUrl: (path: string) => string,
): Product {
  const images: ProductImage[] = [...(row.product_images ?? [])]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.position - b.position;
    })
    .flatMap((image) => {
      // Exactly one of the two is set — see the check constraint on the table.
      const src = image.external_url ?? (image.storage_path ? publicUrl(image.storage_path) : null);
      if (!src) return [];
      return [{
        src,
        alt: image.alt ?? `${row.name}${row.subtitle ? ` — ${row.subtitle}` : ""}`,
      }];
    });

  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    subtitle: row.subtitle ?? "",
    price: Number(row.price),
    compareAt: row.compare_at === null ? null : Number(row.compare_at),
    images,
    colors: readColors(row.colors),
    sizes: row.sizes ?? [],
    isNew: row.is_new,
    collection: row.collection ?? "",
    description: row.description ?? "",
    details: row.details ?? [],
    photographyIsRender: row.photography_is_render,
    soldOut: row.stock === "sold_out",
    comingSoon: row.stock === "coming_soon",
  };
}

/**
 * Every published product, in the order the admin set.
 *
 * RLS already limits anonymous reads to published rows; the explicit filter is
 * here so a signed-in staff member browsing the shop sees what a customer
 * sees rather than their own drafts.
 */
export async function getStoreProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    // An unreachable database should be diagnosable in the logs rather than
    // looking like an empty catalogue to whoever is on call.
    if (error) console.error("shop catalogue:", error.message);
    return [];
  }

  const publicUrl = (path: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  return (data as Row[]).map((row) => toProduct(row, publicUrl));
}

export async function getStoreProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("shop product:", error.message);
    return null;
  }

  const publicUrl = (path: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  return toProduct(data as Row, publicUrl);
}
