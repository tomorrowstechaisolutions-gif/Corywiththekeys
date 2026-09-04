import Link from "next/link";

import type { Kpi } from "@/lib/dashboard";

/**
 * A sparkline drawn from the daily counts, or nothing.
 *
 * Deliberately not rendered when every day is zero: a flat line at the bottom
 * of the card reads as "steady", and no data is not the same as steady.
 */
function Sparkline({ series }: { series: readonly number[] }) {
  if (series.length < 2) return null;
  const max = Math.max(...series);
  if (max === 0) return null;

  const width = 120;
  const height = 28;
  const step = width / (series.length - 1);

  const points = series
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-7 w-full max-w-[140px] text-keyblue-500"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const delta = kpi.delta;
  const up = delta.kind === "percent" && delta.value > 0;
  const down = delta.kind === "percent" && delta.value < 0;

  return (
    <Link
      href={kpi.href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-keyblue-400 hover:shadow-md"
    >
      <p className="text-xs font-medium text-slate-500">{kpi.label}</p>

      <p className="mt-1.5 text-2xl font-bold tracking-tight text-navy-900">
        {kpi.display}
      </p>

      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-[11px] leading-tight text-slate-500">
          {delta.kind === "percent" ? (
            <>
              <span
                className={`font-semibold ${
                  up
                    ? "text-emerald-600"
                    : down
                      ? "text-red-600"
                      : "text-slate-500"
                }`}
              >
                <span aria-hidden>{up ? "↑" : down ? "↓" : "→"}</span>{" "}
                {Math.abs(delta.value)}%
              </span>{" "}
              {delta.label}
            </>
          ) : delta.kind === "note" ? (
            delta.label
          ) : (
            "No change to compare yet"
          )}
        </p>

        <Sparkline series={kpi.series} />
      </div>

      {kpi.unavailable ? (
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-400">
          {kpi.unavailable}
        </p>
      ) : null}
    </Link>
  );
}
