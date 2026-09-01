import type { Metadata } from "next";

import { SITE } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.headline}`,
    template: `%s | ${SITE.name}`,
  },
  description: `${SITE.name} — ${SITE.headline}. Inventory, financing, trade-ins and approvals with ${SITE.personality}.`,
};

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
