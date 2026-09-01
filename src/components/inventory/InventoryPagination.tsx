import Link from "next/link";

import { buildInventoryHref, type InventoryFilters } from "@/lib/inventory-query";

/** Page numbers with ellipses, always showing first, last and the neighbours. */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const output: (number | "gap")[] = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) output.push("gap");
    output.push(page);
  });

  return output;
}

const BASE =
  "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition";

export function InventoryPagination({
  filters,
  pageCount,
}: {
  filters: InventoryFilters;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const current = Math.min(filters.page, pageCount);

  return (
    <nav aria-label="Inventory pages" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {current > 1 ? (
            <Link
              href={buildInventoryHref(filters, { page: current - 1 })}
              rel="prev"
              aria-label="Previous page"
              className={`${BASE} border border-slate-300 text-navy-700 hover:border-keyblue-500 hover:text-keyblue-600`}
            >
              ‹
            </Link>
          ) : (
            <span className={`${BASE} border border-slate-200 text-slate-300`} aria-hidden>
              ‹
            </span>
          )}
        </li>

        {pageList(current, pageCount).map((page, index) =>
          page === "gap" ? (
            <li key={`gap-${index}`} className="px-1 text-sm text-navy-700/50" aria-hidden>
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildInventoryHref(filters, { page })}
                aria-current={page === current ? "page" : undefined}
                className={
                  page === current
                    ? `${BASE} bg-keyblue-600 text-white`
                    : `${BASE} border border-slate-300 text-navy-700 hover:border-keyblue-500 hover:text-keyblue-600`
                }
              >
                {page}
              </Link>
            </li>
          ),
        )}

        <li>
          {current < pageCount ? (
            <Link
              href={buildInventoryHref(filters, { page: current + 1 })}
              rel="next"
              aria-label="Next page"
              className={`${BASE} border border-slate-300 text-navy-700 hover:border-keyblue-500 hover:text-keyblue-600`}
            >
              ›
            </Link>
          ) : (
            <span className={`${BASE} border border-slate-200 text-slate-300`} aria-hidden>
              ›
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
