import Link from "next/link";

import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";
import type { DashboardData } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/utils";

/**
 * Deals by stage.
 *
 * The columns are the nine `deal_stage` values grouped into six; nothing is
 * renamed and no stored row is touched. "Delivered" counts only deliveries
 * inside the selected period — every other column is a live count, because a
 * deal sitting at Approved is sitting there now, not in a date range.
 */
export function PipelineSummary({
  pipeline,
}: {
  pipeline: DashboardData["pipeline"];
}) {
  const busiest = Math.max(1, ...pipeline.stages.map((s) => s.count));
  const anything = pipeline.stages.some((s) => s.count > 0);

  return (
    <DashboardCard
      title="Sales pipeline"
      subtitle="Deals by stage"
      action={{ label: "View pipeline", href: "/admin/pipeline" }}
    >
      {anything ? (
        <>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {pipeline.stages.map((stage, index) => (
              <li key={stage.key}>
                <Link
                  href="/admin/pipeline"
                  className="flex h-full flex-col justify-between rounded-lg px-3 py-2.5 text-white transition hover:brightness-110"
                  style={{
                    // A single ramp from deep navy to the electric blue, so the
                    // eye reads left-to-right as progress rather than category.
                    backgroundColor: `color-mix(in srgb, var(--brand-navy-800) ${
                      100 - index * 16
                    }%, var(--brand-blue-electric))`,
                  }}
                >
                  <span className="text-[11px] font-medium leading-tight text-white/80">
                    {stage.label}
                  </span>
                  <span className="mt-2 text-xl font-bold">{stage.count}</span>
                  <span
                    aria-hidden
                    className="mt-1.5 block h-1 rounded-full bg-white/25"
                  >
                    <span
                      className="block h-1 rounded-full bg-white/80"
                      style={{ width: `${(stage.count / busiest) * 100}%` }}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-4">
            <div>
              <dt className="text-xs text-slate-500">Open pipeline value</dt>
              <dd className="mt-0.5 text-lg font-bold text-navy-900">
                {pipeline.value === null ? "—" : formatCurrency(pipeline.value)}
              </dd>
              {pipeline.value === null ? (
                <dd className="text-[11px] text-slate-400">
                  No sale price on any open deal yet
                </dd>
              ) : null}
            </div>

            <div>
              <dt className="text-xs text-slate-500">Close rate</dt>
              <dd className="mt-0.5 text-lg font-bold text-navy-900">
                {pipeline.conversion === null ? "—" : `${pipeline.conversion}%`}
              </dd>
              <dd className="text-[11px] text-slate-400">
                {pipeline.conversion === null
                  ? "No deal opened this period has closed yet"
                  : `of ${pipeline.conversionBasis} deal${
                      pipeline.conversionBasis === 1 ? "" : "s"
                    } opened and settled this period`}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <EmptyState
          title="No deals yet"
          detail="A deal appears here once a lead is turned into one. Until then the leads list is where the work is."
          action={{ label: "Open leads", href: "/admin/leads" }}
        />
      )}
    </DashboardCard>
  );
}
