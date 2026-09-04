import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The white panel every dashboard widget sits in.
 *
 * One component so the radius, border, padding and header rhythm are decided
 * once. `action` is a link rather than a button: everything on this screen
 * leads somewhere that already exists.
 */
export function DashboardCard({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        // min-w-0 matters: without it a grid item's default min-width of
        // auto lets the wide tables inside stretch the whole column, which
        // the page's overflow-x: clip then hides rather than scrolls.
        "flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        {action ? (
          <Link
            href={action.href}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-keyblue-600 transition hover:bg-keyblue-600/10"
          >
            {action.label} <span aria-hidden>›</span>
          </Link>
        ) : null}
      </header>

      <div className={cn("min-w-0 flex-1 px-5 pb-5 pt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

/** What a widget shows when there is genuinely nothing to show. */
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex h-full flex-col items-start justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6">
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{detail}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-3 rounded-md bg-keyblue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-keyblue-700"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
