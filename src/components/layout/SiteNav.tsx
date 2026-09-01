"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE_NAV } from "@/lib/constants";

/** Primary navigation with the current section marked. */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-5 text-sm font-medium">
        {SITE_NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "relative whitespace-nowrap text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-keyblue-500"
                    : "whitespace-nowrap text-white/85 transition hover:text-white"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
