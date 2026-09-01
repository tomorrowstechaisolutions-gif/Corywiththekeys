"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminNavItem } from "@/lib/admin-nav";

/**
 * The nav list, split out so the sidebar can stay a server component.
 *
 * Highlighting the current route needs `usePathname`, which needs "use
 * client" — and marking the whole sidebar as client pulled `lib/auth`, and
 * through it the server-only Supabase client, into the browser bundle. Only
 * the part that needs the hook lives here; it takes plain data as props.
 */
export function AdminNavLinks({
  items,
  size = "compact",
  onNavigate,
}: {
  items: readonly AdminNavItem[];
  size?: "compact" | "roomy";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 text-sm transition ${
                size === "roomy" ? "py-2.5" : "py-2"
              } ${
                active
                  ? "bg-keyblue-600 font-semibold text-white"
                  : "text-muted hover:bg-navy-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
