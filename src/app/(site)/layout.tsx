import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSettings } from "@/lib/settings";

/**
 * Shell shared by every public-facing route.
 *
 * The business settings are read once here and passed down two ways: server
 * components below take them as props, and client components — the forms, the
 * mobile menu — read them from the provider. `getSettings` is request-cached,
 * so the header, the footer and a form on the page still cost one query.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <SettingsProvider value={settings}>
      <div className="flex min-h-dvh flex-col">
        <AnnouncementBar settings={settings} />
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </div>
    </SettingsProvider>
  );
}
