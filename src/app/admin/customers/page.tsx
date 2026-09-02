import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  await requireSection("customers");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Customers"
      description="Customer records and purchase history."
      scope={[
        "Customer directory and search",
        "Contact and vehicle history",
        "Notes and documents",
        "Repeat-buyer flags",
      ]}
    />
  );
}
