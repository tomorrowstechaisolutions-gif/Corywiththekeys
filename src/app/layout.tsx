import type { Metadata } from "next";

import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

import "./globals.css";

/**
 * Site metadata, including the browser tab icon.
 *
 * A function rather than a constant so the icon can come from Settings.
 * `getSettings()` is already called during rendering of every page and is
 * wrapped in React's cache, so this costs no extra query, and it falls back
 * to the compiled-in values if the database is unreachable.
 *
 * When no icon has been uploaded the `icons` key is left off entirely rather
 * than set to null — that is what lets Next's own `src/app/icon.png` file
 * convention keep working.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} | ${SITE.headline}`,
      template: `%s | ${SITE.name}`,
    },
    description: `${SITE.name} — ${SITE.headline}. Inventory, financing, trade-ins and approvals with ${SITE.personality}.`,
    ...(brand.faviconUrl ? { icons: { icon: brand.faviconUrl } } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
