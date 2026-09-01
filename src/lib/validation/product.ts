import { z } from "zod";

/** Publishing and availability, mirrored from the Postgres enums. */
export const PRODUCT_STATUS = ["draft", "published", "archived"] as const;
export const PRODUCT_STOCK = ["in_stock", "sold_out", "coming_soon"] as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[number];
export type ProductStock = (typeof PRODUCT_STOCK)[number];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const STOCK_LABELS: Record<ProductStock, string> = {
  in_stock: "In stock",
  sold_out: "Sold out",
  coming_soon: "Coming soon",
};

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const optional = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim()) : emptyToNull(v)),
    z.string().max(max).nullable(),
  );

/** "S, M, L, XL" -> ["S","M","L","XL"]. Blank entries dropped. */
const csvList = z.preprocess(
  (v) => (typeof v === "string" ? v : ""),
  z.string().transform((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 40),
  ),
);

/** One per line: "Red #c0231f". The hex is optional and defaults to grey. */
const colorList = z.preprocess(
  (v) => (typeof v === "string" ? v : ""),
  z.string().transform((value, ctx) => {
    const rows = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 24);

    return rows.map((row) => {
      const match = row.match(/^(.*?)\s+(#[0-9a-fA-F]{3,8})\s*$/);
      if (!match) return { name: row.slice(0, 40), hex: "#8b8b8b" };

      const [, name, hex] = match;
      if (!name.trim()) {
        ctx.addIssue({ code: "custom", message: "Every colour needs a name." });
        return z.NEVER as never;
      }
      return { name: name.trim().slice(0, 40), hex: hex.toLowerCase() };
    });
  }),
);

/** Slug from the name when the field is left blank. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const ProductSchema = z.object({
  name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(2, "Give the product a name.").max(120),
  ),
  slug: z.preprocess(
    (v) => (typeof v === "string" ? emptyToNull(v.trim().toLowerCase()) : emptyToNull(v)),
    z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens only.",
      )
      .max(80)
      .nullable(),
  ),
  category: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "Give it a category.").max(60),
  ),
  subtitle: optional(160),
  description: optional(4000),
  /** One bullet per line on the product page. */
  details: z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string().transform((value) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 20),
    ),
  ),
  price: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().replace(/[$,]/g, "") : v),
    z.coerce
      .number({ message: "Enter a price." })
      .min(0, "Price cannot be negative.")
      .max(100000, "That price looks wrong."),
  ),
  compareAt: z.preprocess(
    (v) =>
      typeof v === "string"
        ? emptyToNull(v.trim().replace(/[$,]/g, ""))
        : emptyToNull(v),
    z.coerce.number().min(0).max(100000).nullable(),
  ),
  collection: optional(80),
  sizes: csvList,
  colors: colorList,
  isNew: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  photographyIsRender: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  status: z.enum(PRODUCT_STATUS),
  stock: z.enum(PRODUCT_STOCK),
  position: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : 0),
    z.coerce.number().int().min(0).max(9999),
  ),
});

export type ProductInput = z.infer<typeof ProductSchema>;

/** Turns stored colours back into the textarea format the form expects. */
export function colorsToText(
  colors: { name: string; hex: string }[] | null,
): string {
  return (colors ?? []).map((c) => `${c.name} ${c.hex}`).join("\n");
}
