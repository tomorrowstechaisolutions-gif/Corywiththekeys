"use client";

import { usePathname } from "next/navigation";

/**
 * Where you are, shown in the top bar.
 *
 * Takes the nav as plain data and matches the longest href that prefixes the
 * current path, so /admin/inventory/new still reads "Vehicles · Inventory".
 * Needs usePathname, hence a client component; it never sees a profile.
 */
export function AdminBreadcrumb({
  items,
}: {
  items: readonly { href: string; label: string; group: string }[];
}) {
  const pathname = usePathname();

  const match = items
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!match) return null;

  return (
    <p className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex">
      <span className="truncate uppercase tracking-[0.14em] text-slate-400">
        {match.group}
      </span>
      <span aria-hidden className="text-slate-300">
        /
      </span>
      <span className="truncate font-semibold text-navy-900">
        {match.label}
      </span>
    </p>
  );
}
