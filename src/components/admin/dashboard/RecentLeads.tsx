import Link from "next/link";

import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  leadName,
  timeAgo,
  type Lead,
} from "@/lib/leads";

/** The last handful of enquiries, newest activity first. */
export function RecentLeads({
  leads,
  vehicleTitles,
  now,
}: {
  leads: readonly Lead[];
  vehicleTitles: ReadonlyMap<string, string>;
  now: Date;
}) {
  return (
    <DashboardCard
      title="Recent leads"
      subtitle="Most recent activity first"
      action={{ label: "View all leads", href: "/admin/leads" }}
      bodyClassName="px-0 pb-0 pt-2"
    >
      {leads.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState
            title="No leads yet"
            detail="Enquiries from the website land here automatically. You can also type one in by hand."
            action={{ label: "Add a lead", href: "/admin/leads/new" }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th scope="col" className="whitespace-nowrap px-4 py-2 font-semibold">Name</th>
                <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">Vehicle</th>
                <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">Source</th>
                <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">Status</th>
                <th scope="col" className="whitespace-nowrap px-2.5 py-2 font-semibold">Activity</th>
                <th scope="col" className="whitespace-nowrap px-4 py-2 text-right font-semibold">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-slate-50/70">
                  <td className="max-w-[130px] truncate px-4 py-2.5">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-navy-900 hover:text-keyblue-600"
                    >
                      {leadName(lead)}
                    </Link>
                  </td>
                  <td className="max-w-[110px] truncate px-2.5 py-2.5 text-slate-600">
                    {lead.vehicle_id
                      ? (vehicleTitles.get(lead.vehicle_id) ?? "A listed vehicle")
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2.5 text-slate-600">
                    {LEAD_SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="px-2.5 py-2.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEAD_STATUS_STYLES[lead.status]}`}
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-slate-500">
                    {timeAgo(lead.last_activity_at, now)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs font-semibold text-keyblue-600 hover:underline"
                      >
                        Call
                      </a>
                    ) : lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-xs font-semibold text-keyblue-600 hover:underline"
                      >
                        Email
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No contact</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
