import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Customers",
};

export default function AdminCustomersPage() {
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
