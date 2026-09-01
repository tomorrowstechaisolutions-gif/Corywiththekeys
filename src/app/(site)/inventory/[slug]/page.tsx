import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Vehicle: ${slug}` };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <PagePlaceholder
      eyebrow="Inventory"
      title="Vehicle Detail"
      description={`Route placeholder for a single vehicle. Resolving slug "${slug}" against Supabase happens once the inventory schema exists.`}
      scope={[
        "Photo gallery from Supabase Storage",
        "Specs, history and disclosures",
        "Estimated payment and financing CTA",
        "Schedule test drive / apply hand-off",
        "generateStaticParams for published vehicles",
      ]}
    />
  );
}
