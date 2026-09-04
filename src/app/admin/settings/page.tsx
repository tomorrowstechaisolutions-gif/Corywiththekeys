import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { brandImageUrl, BRAND_FALLBACKS } from "@/lib/brand";

import {
  BrandForm,
  BusinessForm,
  HoursForm,
  NotificationsForm,
  SocialsForm,
  SwitchesForm,
} from "./SettingsForms";

export const metadata: Metadata = {
  title: "Settings",
};

/** Settings are edited here and read everywhere, so never serve them stale. */
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Admin only. Sales and viewer are redirected to their own landing page.
  await requireSection("settings");

  const supabase = await createClient();

  const [settingsResult, hoursResult, notificationsResult] = await Promise.all([
    supabase.from("site_settings").select("*").maybeSingle(),
    supabase.from("business_hours").select("*").order("day_of_week"),
    supabase.from("notification_settings").select("*").maybeSingle(),
  ]);

  const settings = settingsResult.data;
  const hours = hoursResult.data ?? [];
  const notifications = notificationsResult.data;

  // Without the row there is nothing to edit, and a form full of blanks that
  // silently fails to save is worse than saying so plainly.
  if (!settings || !notifications) {
    return (
      <Container className="py-8">
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          The settings could not be loaded, so there is nothing to edit here
          right now. The website is still running on the details built into the
          code, so nothing is broken for visitors. Try reloading; if it keeps
          happening the database is unreachable.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-navy-700">
          Everything here changes the live website as soon as you save it. Staff
          and who can reach what are on the Team screen instead.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <BusinessForm settings={settings} />
        <HoursForm hours={hours} />
        <SocialsForm settings={settings} />
        <SwitchesForm settings={settings} />
        <BrandForm
          settings={settings}
          brand={{
            // Resolved here rather than in the form, which is a client
            // component and has no business building storage URLs.
            loginLogoUrl:
              brandImageUrl(settings.login_logo_path ?? null) ??
              BRAND_FALLBACKS.login_logo,
            adminMarkUrl:
              brandImageUrl(settings.admin_mark_path ?? null) ??
              BRAND_FALLBACKS.admin_mark,
            faviconUrl:
              brandImageUrl(settings.favicon_path ?? null) ??
              BRAND_FALLBACKS.favicon,
          }}
        />
        <NotificationsForm notifications={notifications} />
      </div>

      <p className="mt-8 text-xs text-navy-700/70">
        Every change is recorded in the audit log with who made it and when.
      </p>
    </Container>
  );
}
