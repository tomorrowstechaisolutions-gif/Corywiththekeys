/**
 * Lightweight client-side event tracking.
 *
 * There is no analytics provider wired into this project yet. Rather than
 * install one uninvited, this pushes to `window.dataLayer` — the convention
 * Google Tag Manager, GA4 and most tag managers already read — and does
 * nothing at all when none is present. Adding a provider later is a script
 * tag; the call sites here do not change.
 *
 * NEVER pass financial or identifying detail through this. No names, phone
 * numbers, emails, down payment figures or anything from a credit
 * application. Event names and campaign attribution only.
 */

export type AnalyticsEvent =
  | "finance_page_view"
  | "finance_application_click"
  | "finance_inventory_click"
  | "finance_lead_started"
  | "finance_lead_submitted";

type Payload = {
  /** Which page the event fired from. */
  source_page?: string;
  /** Where on the page the CTA sat, so we can tell which one converts. */
  placement?: string;
  /** Only ever an id, never a description a person typed. */
  vehicle_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Reads UTM parameters off the current URL, if any are there. */
function campaignParams(): Pick<
  Payload,
  "utm_source" | "utm_medium" | "utm_campaign"
> {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const pick = (key: string) => params.get(key) ?? undefined;
    return {
      utm_source: pick("utm_source"),
      utm_medium: pick("utm_medium"),
      utm_campaign: pick("utm_campaign"),
    };
  } catch {
    return {};
  }
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event,
      source_page: window.location.pathname,
      ...campaignParams(),
      ...payload,
    });
  } catch {
    // Analytics must never break the page it is measuring.
  }
}
