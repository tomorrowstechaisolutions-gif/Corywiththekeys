import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { SITE } from "@/lib/constants";

export default function HomePage() {
  return (
    <PagePlaceholder
      eyebrow={SITE.personality}
      title={SITE.headline}
      description="Route placeholder for the homepage. The approved hero, featured inventory rail, fast-approval form, trust bar and review carousel are built in a later phase."
      scope={[
        "Hero — headline, dual CTA, call/text line",
        "Featured inventory rail pulled from Supabase",
        "Get Approved Fast lead capture form",
        "Why Choose The Key Konnect trust bar",
        "Customer review carousel",
      ]}
    />
  );
}
