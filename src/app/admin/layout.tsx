import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

/**
 * Shell for every /admin route.
 *
 * requireStaff() runs here rather than only in middleware: middleware proves
 * a session exists, this proves the account is active staff, and RLS decides
 * what the queries underneath are allowed to return.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireStaff();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar profile={profile} />
        <main className="flex-1 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
