import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireStaff } from "@/lib/auth";

import { createProduct } from "../actions";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const profile = await requireStaff();

  if (!canWrite(profile)) {
    redirect("/admin/shop?error=forbidden");
  }

  return (
    <Container className="py-8">
      <nav className="text-xs text-navy-700">
        <Link href="/admin/shop" className="hover:text-keyblue-600">
          Merch store
        </Link>
        <span className="mx-1.5">/</span>
        <span>Add product</span>
      </nav>

      <h1 className="mt-2 text-2xl font-bold text-navy-900">Add product</h1>
      <p className="mt-1 text-sm text-navy-700">
        Saves as a draft. You add the pictures on the next screen, then publish
        it when it looks right — nothing reaches the store until then.
      </p>

      <div className="mt-6 max-w-4xl">
        <ProductForm action={createProduct} submitLabel="Create product" />
      </div>
    </Container>
  );
}
