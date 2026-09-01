import type { Metadata } from "next";

import { FinanceLeadForm } from "@/components/finance/FinanceLeadForm";
import {
  FinanceBrandBanner,
  FinanceHero,
  FinanceProcess,
  FinanceTrustStrip,
} from "@/components/finance/FinanceSections";
import {
  FinancePageView,
  MobileFinanceCTA,
} from "@/components/finance/MobileFinanceCTA";
import { SITE } from "@/lib/constants";

const DESCRIPTION =
  "Start your vehicle financing journey with The Key Konnect. Tell us what you're looking for, complete the secure application, and let our team help you explore vehicle and financing options.";

export const metadata: Metadata = {
  title: "Auto Financing",
  description: DESCRIPTION,
  alternates: { canonical: "/finance" },
  openGraph: {
    title: `Auto Financing | ${SITE.name} | ${SITE.personality}`,
    description: DESCRIPTION,
    url: `${SITE.url}/finance`,
    siteName: SITE.name,
    type: "website",
    images: [
      {
        url: "/brand/finance/hero.webp",
        width: 2000,
        height: 956,
        alt: "A black performance car at night in front of a city skyline",
      },
    ],
  },
};

/**
 * /finance — the branded introduction to financing.
 *
 * This page does not take a credit application. It explains the process,
 * captures an optional shopping enquiry, and hands off to The Key Konnect's
 * existing secure application. No SSN, licence, date of birth, bank detail or
 * credit data is collected or stored by this site.
 */
export default function FinancePage() {
  return (
    <div className="bg-finance-bg">
      <FinancePageView />
      <FinanceHero />
      <FinanceProcess />
      <FinanceTrustStrip />
      <FinanceBrandBanner />
      <FinanceLeadForm />
      <MobileFinanceCTA />
      {/* Clears the sticky bar so it never covers the footer on a phone. */}
      <div aria-hidden className="h-20 lg:hidden" />
    </div>
  );
}
