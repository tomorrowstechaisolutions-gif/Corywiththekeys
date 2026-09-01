"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ProductSchema,
  slugify,
  type ProductInput,
  type ProductStatus,
} from "@/lib/validation/product";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const BUCKET = "product-photos";

/**
 * Same shape as the inventory guard, and for the same reasons: writes run on
 * the signed-in user's session so RLS still applies and the audit trail knows
 * who changed a price.
 */
async function guard() {
  const profile = await requireStaff();

  if (!canWrite(profile)) {
    return { profile, denied: "Your role cannot change the store." as const };
  }

  return { profile, denied: null };
}

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

function parseProductForm(formData: FormData) {
  return ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    details: formData.get("details"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt"),
    collection: formData.get("collection"),
    sizes: formData.get("sizes"),
    colors: formData.get("colors"),
    isNew: formData.get("isNew"),
    photographyIsRender: formData.get("photographyIsRender"),
    status: formData.get("status"),
    stock: formData.get("stock"),
    position: formData.get("position"),
  });
}

/** Database columns, from the validated form. */
function toRow(input: ProductInput, slug: string) {
  return {
    slug,
    name: input.name,
    category: input.category,
    subtitle: input.subtitle,
    description: input.description,
    details: input.details,
    price: input.price,
    compare_at: input.compareAt,
    collection: input.collection,
    sizes: input.sizes,
    colors: input.colors,
    is_new: input.isNew,
    photography_is_render: input.photographyIsRender,
    status: input.status,
    stock: input.stock,
    position: input.position,
  };
}

/**
 * The URL the product lives at. It has to be unique, and it is also what a
 * customer sees, so it is derived from the name when the field is left blank
 * and given a numeric suffix only if something already holds it.
 */
function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "product";
  if (!taken.has(root)) return root;

  for (let n = 2; n < 200; n += 1) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

function friendlyDbError(message: string): string {
  if (message.includes("products_slug_key")) {
    return "Another product already uses that web address. Change the slug.";
  }
  if (message.includes("products_price_check")) {
    return "The price cannot be negative.";
  }
  return "Could not save this product. Please try again.";
}

export async function createProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("products").select("slug");
  const taken = new Set((existing ?? []).map((row) => row.slug));

  const slug = input.slug
    ? input.slug
    : uniqueSlug(slugify(input.name), taken);

  if (input.slug && taken.has(input.slug)) {
    return {
      fieldErrors: {
        slug: "Another product already uses that web address.",
      },
    };
  }

  const { data, error } = await supabase
    .from("products")
    .insert(toRow(input, slug))
    .select("id")
    .single();

  if (error || !data) {
    return { error: friendlyDbError(error?.message ?? "") };
  }

  revalidatePath("/admin/shop");
  redirect(`/admin/shop/${data.id}?created=1`);
}

export async function updateProduct(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (!current) return { error: "That product no longer exists." };

  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .neq("id", id);
  const taken = new Set((existing ?? []).map((row) => row.slug));

  const slug = input.slug ?? current.slug;
  if (taken.has(slug)) {
    return {
      fieldErrors: { slug: "Another product already uses that web address." },
    };
  }

  const { error } = await supabase
    .from("products")
    .update(toRow(input, slug))
    .eq("id", id);

  if (error) return { error: friendlyDbError(error.message) };

  revalidatePath("/admin/shop");
  revalidatePath(`/admin/shop/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  return { ok: true };
}

/** Quick publish / unpublish from the list view. */
export async function setProductStatus(id: string, status: ProductStatus) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();
  await supabase.from("products").update({ status }).eq("id", id);

  revalidatePath("/admin/shop");
  revalidatePath(`/admin/shop/${id}`);
  revalidatePath("/shop");
}

/**
 * Record photos the browser has ALREADY uploaded to Storage.
 *
 * Identical in spirit to the vehicle version: the files never pass through
 * this server (Server Actions cap bodies at 1 MB), and because the client
 * chose the paths, each one is checked against the product's own prefix and
 * confirmed to exist before a row is written.
 */
export async function registerProductPhotos(
  productId: string,
  paths: string[],
): Promise<FormState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  if (paths.length === 0) return { error: "No photos to save." };

  const prefix = `${productId}/`;
  if (paths.some((path) => !path.startsWith(prefix) || path.includes(".."))) {
    return { error: "Those photos do not belong to this product." };
  }

  const supabase = await createClient();

  const { data: objects } = await supabase.storage
    .from(BUCKET)
    .list(productId);

  const present = new Set((objects ?? []).map((o) => `${prefix}${o.name}`));
  const verified = paths.filter((path) => present.has(path));

  if (verified.length === 0) {
    return { error: "Those uploads did not arrive. Please try again." };
  }

  const { data: existing } = await supabase
    .from("product_images")
    .select("position, is_primary")
    .eq("product_id", productId)
    .order("position", { ascending: false });

  let position = existing?.[0]?.position ?? -1;
  let hasPrimary = (existing ?? []).some((p) => p.is_primary);

  const rows = verified.map((path) => {
    position += 1;
    const row = {
      product_id: productId,
      storage_path: path,
      position,
      is_primary: !hasPrimary,
    };
    hasPrimary = true;
    return row;
  });

  const { error } = await supabase.from("product_images").insert(rows);

  if (error) {
    await supabase.storage.from(BUCKET).remove(verified);
    return { error: "Could not save those photos. Please try again." };
  }

  revalidatePath(`/admin/shop/${productId}`);
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteProductPhoto(photoId: string, productId: string) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("product_images")
    .select("storage_path, is_primary")
    .eq("id", photoId)
    .single();

  await supabase.from("product_images").delete().eq("id", photoId);

  if (photo?.storage_path) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  }

  // A product should not be left without a main image.
  if (photo?.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", next.id);
    }
  }

  revalidatePath(`/admin/shop/${productId}`);
  revalidatePath("/shop");
}

export async function setPrimaryProductPhoto(
  photoId: string,
  productId: string,
) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  // A partial unique index allows only one primary per product, so the old
  // one has to be cleared before the new one is set.
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("is_primary", true);

  await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", photoId);

  revalidatePath(`/admin/shop/${productId}`);
  revalidatePath("/shop");
}

/** Reorder a photo by swapping positions with its neighbour. */
export async function moveProductPhoto(
  photoId: string,
  productId: string,
  direction: "up" | "down",
) {
  const { denied } = await guard();
  if (denied) return;

  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("product_images")
    .select("id, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (!photos) return;

  const index = photos.findIndex((p) => p.id === photoId);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= photos.length) return;

  const current = photos[index];
  const other = photos[swapWith];

  await supabase
    .from("product_images")
    .update({ position: other.position })
    .eq("id", current.id);

  await supabase
    .from("product_images")
    .update({ position: current.position })
    .eq("id", other.id);

  revalidatePath(`/admin/shop/${productId}`);
  revalidatePath("/shop");
}
