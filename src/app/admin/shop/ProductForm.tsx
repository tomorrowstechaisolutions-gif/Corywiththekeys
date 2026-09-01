"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Checkbox,
  Field,
  Fieldset,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui/Field";
import {
  colorsToText,
  PRODUCT_STATUS,
  PRODUCT_STOCK,
  STATUS_LABELS,
  STOCK_LABELS,
} from "@/lib/validation/product";
import type { Database } from "@/types/database";

import type { FormState } from "./actions";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/** Collections the storefront already knows how to group by. */
const COLLECTION_OPTIONS = [
  { value: "keys-2-success", label: "Keys 2 Success" },
  { value: "cory-with-the-keys", label: "Cory With The Keys" },
  { value: "hustle", label: "Hustle Collection" },
  { value: "statement-tees", label: "Statement Tees" },
];

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

/**
 * The stored `colors` column is jsonb, so it arrives as Json. The shape is
 * written by this form and by nothing else, but a bad row should degrade to an
 * empty list rather than crash the editor.
 */
function readColors(value: ProductRow["colors"]): { name: string; hex: string }[] {
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

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  product?: ProductRow;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Saved.
        </p>
      ) : null}

      <Fieldset legend="Product" columns={2}>
        <Field label="Name" htmlFor="name" error={err("name")}>
          <TextInput
            id="name"
            name="name"
            placeholder="Keys 2 Success"
            defaultValue={product?.name ?? ""}
            required
          />
        </Field>

        <Field
          label="Subtitle"
          htmlFor="subtitle"
          error={err("subtitle")}
          hint="The line under the name on the card. e.g. “Signature Hoodie – Red”."
        >
          <TextInput
            id="subtitle"
            name="subtitle"
            defaultValue={product?.subtitle ?? ""}
          />
        </Field>

        <Field
          label="Category"
          htmlFor="category"
          error={err("category")}
          hint="Shown above the name. Hoodies, Tees, Accessories…"
        >
          <TextInput
            id="category"
            name="category"
            defaultValue={product?.category ?? "Merch"}
            required
          />
        </Field>

        <Field
          label="Collection"
          htmlFor="collection"
          error={err("collection")}
          hint="Groups it under a collection tile on the store front page."
        >
          <Select
            id="collection"
            name="collection"
            defaultValue={product?.collection ?? ""}
          >
            <option value="">— none —</option>
            {COLLECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Web address"
          htmlFor="slug"
          error={err("slug")}
          hint={
            product
              ? `thekeykonnect.com/shop/${product.slug}`
              : "Leave blank and it is built from the name."
          }
        >
          <TextInput
            id="slug"
            name="slug"
            placeholder="keys-2-success-signature-hoodie"
            defaultValue={product?.slug ?? ""}
          />
        </Field>

        <Field
          label="Sort order"
          htmlFor="position"
          error={err("position")}
          hint="Lower numbers come first in the grid."
        >
          <TextInput
            id="position"
            name="position"
            inputMode="numeric"
            defaultValue={product?.position ?? 0}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Price" columns={2}>
        <Field label="Price" htmlFor="price" error={err("price")}>
          <TextInput
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="65"
            defaultValue={product?.price ?? ""}
            required
          />
        </Field>

        <Field
          label="Compare-at price"
          htmlFor="compareAt"
          error={err("compareAt")}
          hint="Optional. Shown struck through beside the price. Only use a price the item genuinely sold at."
        >
          <TextInput
            id="compareAt"
            name="compareAt"
            inputMode="decimal"
            defaultValue={product?.compare_at ?? ""}
          />
        </Field>
      </Fieldset>

      <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-navy-900">
          Product page copy
        </legend>
        <div className="grid gap-4">
          <Field label="Description" htmlFor="description" error={err("description")}>
            <TextArea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </Field>

          <Field
            label="Details"
            htmlFor="details"
            error={err("details")}
            hint="One bullet per line."
          >
            <TextArea
              id="details"
              name="details"
              rows={4}
              placeholder={"Heavyweight cotton-blend fleece\nRibbed cuffs and hem"}
              defaultValue={(product?.details ?? []).join("\n")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-navy-900">
          Sizes and colours
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Sizes"
            htmlFor="sizes"
            error={err("sizes")}
            hint="Separated by commas. Leave blank for one-size items."
          >
            <TextInput
              id="sizes"
              name="sizes"
              placeholder="S, M, L, XL, 2XL, 3XL"
              defaultValue={(product?.sizes ?? []).join(", ")}
            />
          </Field>

          <Field
            label="Colours"
            htmlFor="colors"
            error={err("colors")}
            hint="One per line, name then hex: “Red #c0231f”. The hex is only the swatch dot."
          >
            <TextArea
              id="colors"
              name="colors"
              rows={4}
              placeholder={"Red #c0231f\nBlack #111318"}
              defaultValue={colorsToText(readColors(product?.colors ?? []))}
            />
          </Field>
        </div>
      </fieldset>

      <Fieldset legend="Availability" columns={2}>
        <Field
          label="Status"
          htmlFor="status"
          error={err("status")}
          hint="Only Published products appear in the store."
        >
          <Select
            id="status"
            name="status"
            defaultValue={product?.status ?? "draft"}
          >
            {PRODUCT_STATUS.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Stock" htmlFor="stock" error={err("stock")}>
          <Select
            id="stock"
            name="stock"
            defaultValue={product?.stock ?? "in_stock"}
          >
            {PRODUCT_STOCK.map((value) => (
              <option key={value} value={value}>
                {STOCK_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-end pb-2">
          <Checkbox
            name="isNew"
            defaultChecked={product?.is_new ?? false}
            label="Mark as a new drop"
            description="Adds the NEW badge and lists it under New Drops."
          />
        </div>

        <div className="flex items-end pb-2">
          <Checkbox
            name="photographyIsRender"
            defaultChecked={product?.photography_is_render ?? true}
            label="Images are mockup renders"
            description="Leave ticked until a real photo of the actual garment replaces the design render. Checkout stays off while any product is ticked."
          />
        </div>
      </Fieldset>

      <div className="flex items-center gap-3">
        <SaveButton label={submitLabel} />
        <Link
          href="/admin/shop"
          className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
