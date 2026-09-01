import Link from "next/link";

import { ADMIN_NAV, SITE } from "@/lib/constants";

/** Admin console navigation rail. Structure only. */
export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-navy-950 text-white lg:block">
      <div className="px-5 py-5">
        <Link href="/admin/dashboard" className="block leading-tight">
          <span className="block text-sm font-bold">{SITE.name}</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
            Admin Console
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="px-2 pb-8">
        <ul className="space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-navy-800 hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
