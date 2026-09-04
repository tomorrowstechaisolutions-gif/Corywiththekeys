import Link from "next/link";

import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";
import type { ActivityItem } from "@/lib/dashboard";
import { timeAgo } from "@/lib/leads";

/** The most recent rows from audit_log, in plain language. */
export function ActivityFeed({
  items,
  now,
}: {
  items: readonly ActivityItem[];
  now: Date;
}) {
  return (
    <DashboardCard
      title="Activity"
      subtitle="Latest changes"
      action={{ label: "View all activity", href: "/admin/activity" }}
    >
      {items.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          detail="Every change to a lead, vehicle or deal is written to the audit log and shows up here."
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const body = (
              <>
                <span className="block text-sm font-medium leading-snug text-navy-900">
                  {item.label}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {item.actor} · {timeAgo(item.at, now)}
                </span>
              </>
            );

            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-keyblue-400"
                />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="min-w-0 flex-1 rounded transition hover:text-keyblue-600"
                  >
                    {body}
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
