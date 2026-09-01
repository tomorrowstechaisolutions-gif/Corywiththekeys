/**
 * Seed the merch catalogue from SEED_PRODUCTS.
 *
 *   npm run seed:products
 *
 * Safe to re-run: products are matched on slug and skipped if they already
 * exist, so this never duplicates a row or overwrites an edit made in the
 * admin.
 *
 * The launch artwork ships in the repo under /public/brand/shop, so the image
 * rows use `external_url` rather than the product-photos bucket. Real
 * photographs get uploaded through /admin/shop, land in the bucket, and are
 * stored as `storage_path` instead — the table's check constraint keeps
 * exactly one of the two set.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY: it writes as an unauthenticated script,
 * with no signed-in staff session for RLS to check.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import { SEED_PRODUCTS } from "../src/data/shop";
import type { Database } from "../src/types/database";

config({ path: ".env.local", quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: existing, error: readError } = await supabase
    .from("products")
    .select("slug");

  if (readError) {
    console.error("Could not read products:", readError.message);
    process.exit(1);
  }

  const taken = new Set((existing ?? []).map((row) => row.slug));

  let created = 0;
  let skipped = 0;

  for (const [index, seed] of SEED_PRODUCTS.entries()) {
    if (taken.has(seed.slug)) {
      console.log(`· ${seed.slug} — already there, left alone`);
      skipped += 1;
      continue;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: seed.slug,
        name: seed.name,
        category: seed.category,
        subtitle: seed.subtitle,
        description: seed.description,
        details: seed.details,
        price: seed.price,
        compare_at: seed.compareAt,
        collection: seed.collection,
        sizes: seed.sizes,
        colors: seed.colors,
        is_new: seed.isNew,
        photography_is_render: seed.photographyIsRender,
        status: "published",
        stock: "in_stock",
        position: index,
      })
      .select("id")
      .single();

    if (error || !product) {
      console.error(`✗ ${seed.slug}: ${error?.message}`);
      continue;
    }

    const rows = seed.images.map((image, imageIndex) => ({
      product_id: product.id,
      external_url: image.src,
      alt: image.alt,
      position: imageIndex,
      is_primary: imageIndex === 0,
    }));

    if (rows.length > 0) {
      const { error: imageError } = await supabase
        .from("product_images")
        .insert(rows);
      if (imageError) console.error(`  ✗ images: ${imageError.message}`);
    }

    console.log(`✓ ${seed.slug}`);
    created += 1;
  }

  console.log(`\n${created} created, ${skipped} already present.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
