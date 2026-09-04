"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";

import {
  RANGE_KEYS,
  RANGE_LABELS,
  type RangeKey,
} from "@/lib/dashboard-ranges";

/**
 * Which window the dashboard is read through.
 *
 * A plain select, submitted on change. It pushes a query string rather than
 * holding state, so the choice survives a refresh and can be linked to — and
 * the figures are still worked out on the server against RLS.
 */
export function DateRangePicker({
  value,
  spanLabel,
}: {
  value: RangeKey;
  spanLabel: string;
}) {
  const router = useRouter();
  const id = useId();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="h-4 w-4 shrink-0 text-slate-400"
        aria-hidden
      >
        <path d="M4 6h16v14H4zM4 10h16M8 3v4m8-4v4" />
      </svg>

      <label htmlFor={id} className="sr-only">
        Date range
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          router.push(`/admin/dashboard?range=${event.target.value}`)
        }
        className="cursor-pointer border-0 bg-transparent py-0 pr-6 text-sm font-medium text-navy-900 focus:outline-none focus:ring-0"
      >
        {RANGE_KEYS.map((key) => (
          <option key={key} value={key}>
            {RANGE_LABELS[key]}
          </option>
        ))}
      </select>

      <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:block">
        {spanLabel}
      </span>
    </div>
  );
}
