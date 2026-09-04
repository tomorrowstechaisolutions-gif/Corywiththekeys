"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavIcon } from "@/components/admin/NavIcon";
import type { AdminNavGroup } from "@/lib/admin-nav";

/**
 * The grouped nav list, split out so the sidebar can stay a server component.
 *
 * Highlighting the current route needs `usePathname`, which needs "use
 * client" — and marking the whole sidebar as client pulled `lib/auth`, and
 * through it the server-only Supabase client, into the browser bundle. Only
 * the part that needs the hook lives here; it takes plain data as props.
 */
export function AdminNavLinks({
  groups,
  size = "compact",
  collapsed = false,
  onNavigate,
}: {
  groups: readonly AdminNavGroup[];
  size?: "compact" | "roomy";
  /** Icon-only rail. Labels stay in the DOM for screen readers. */
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className={collapsed ? "space-y-2" : "space-y-5"}>
      {groups.map((group) => (
        <div key={group.key}>
          {collapsed ? (
            <div
              aria-hidden
              className="mx-auto my-2 h-px w-6 bg-white/10 first:hidden"
            />
          ) : (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              {group.label}
            </p>
          )}

          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 rounded-md text-[13px] transition ${
                      collapsed ? "justify-center px-0 py-2" : "px-3"
                    } ${size === "roomy" && !collapsed ? "py-2.5" : "py-2"} ${
                      active
                        ? "bg-keyblue-600 font-semibold text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <NavIcon
                      name={item.key}
                      className="h-4 w-4 shrink-0 opacity-90"
                    />
                    <span className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>
                      {item.label}
                    </span>
                    {!collapsed && item.planned ? (
                      <span
                        title="Planned — this screen is a stand-in"
                        className={`shrink-0 rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wider ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        Soon
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
