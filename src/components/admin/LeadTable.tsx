import Link from "next/link";

import {
  ATTENTION_STYLES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  attention,
  leadName,
  timeAgo,
  type Lead,
} from "@/lib/leads";

/**
 * The list itself, as its own component so the page is left doing only what
 * a page should: fetching, filtering and ordering. It also means the table
 * can be rendered against fixtures to check how it looks without a database.
 */
export function LeadTable({
  leads,
  owners,
  now = new Date(),
}: {
  leads: Lead[];
  /** Profile id → display name, for the Owner column. */
  owners: Map<string, string>;
  now?: Date;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[54rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr className="text-xs uppercase tracking-wider text-navy-700">
            <th className="px-4 py-3 font-semibold">Who</th>
            <th className="px-4 py-3 font-semibold">Stage</th>
            <th className="px-4 py-3 font-semibold">Needs</th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Came from</th>
            <th className="px-4 py-3 font-semibold">Last touched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => {
            const flag = attention(lead, now);

            return (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="font-semibold text-navy-900 hover:text-keyblue-600"
                  >
                    {leadName(lead)}
                  </Link>
                  <div className="mt-0.5 text-xs text-navy-700">
                    {lead.phone ?? lead.email ?? "No contact details"}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${LEAD_STATUS_STYLES[lead.status]}`}
                  >
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {flag.kind === "none" ? (
                    <span className="text-xs text-navy-700/50">—</span>
                  ) : (
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${ATTENTION_STYLES[flag.kind]}`}
                    >
                      {flag.label}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-navy-700">
                  {lead.assigned_to ? (
                    (owners.get(lead.assigned_to) ?? "Someone")
                  ) : (
                    <span className="text-amber-700">Nobody</span>
                  )}
                </td>

                <td className="px-4 py-3 text-navy-700">
                  {LEAD_SOURCE_LABELS[lead.source]}
                </td>

                <td className="px-4 py-3 text-navy-700">
                  {timeAgo(lead.last_activity_at, now)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
