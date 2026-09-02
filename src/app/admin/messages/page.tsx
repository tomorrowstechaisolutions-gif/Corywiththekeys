import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { requireSection } from "@/lib/auth";
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES, leadName } from "@/lib/leads";
import {
  CHANNEL_LABELS,
  messageTime,
  preview,
  type Thread,
} from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

/** Enough to cover months of a small lot's traffic without paging the UI. */
const MESSAGE_LIMIT = 500;

type Filter = "all" | "unread";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireSection("messages");
  const { filter } = await searchParams;
  const active: Filter = filter === "unread" ? "unread" : "all";

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("messages")
    .select(
      "id, lead_id, channel, direction, subject, body, sent_at, read_at, leads(id, first_name, last_name, email, phone, status)",
    )
    .not("lead_id", "is", null)
    .order("sent_at", { ascending: false })
    .limit(MESSAGE_LIMIT);

  // Rows arrive newest first, so the first row seen for a lead is that
  // thread's latest message and everything after it only adds counts.
  const threads = new Map<string, Thread>();

  for (const row of rows ?? []) {
    const lead = row.leads;
    if (!row.lead_id || !lead) continue;

    const existing = threads.get(row.lead_id);

    if (!existing) {
      threads.set(row.lead_id, {
        leadId: row.lead_id,
        name: leadName(lead),
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        channel: row.channel,
        subject: row.subject,
        preview: preview(row.body),
        lastAt: row.sent_at,
        lastDirection: row.direction,
        unread: row.direction === "inbound" && !row.read_at ? 1 : 0,
        total: 1,
      });
      continue;
    }

    existing.total += 1;
    if (row.direction === "inbound" && !row.read_at) existing.unread += 1;
  }

  const all = [...threads.values()];
  const unreadThreads = all.filter((thread) => thread.unread > 0).length;
  const visible = active === "unread" ? all.filter((t) => t.unread > 0) : all;

  const now = new Date();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-navy-900">Messages</h1>
      <p className="mt-1 text-sm text-navy-700">
        Every enquiry sent from the website, newest first. Opening a
        conversation marks it read.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterTab href="/admin/messages" label="All" count={all.length} active={active === "all"} />
        <FilterTab
          href="/admin/messages?filter=unread"
          label="Unread"
          count={unreadThreads}
          active={active === "unread"}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {visible.map((thread) => (
            <li key={thread.leadId}>
              <Link
                href={`/admin/messages/${thread.leadId}`}
                className="flex items-start gap-4 px-4 py-4 transition hover:bg-slate-50"
              >
                <span
                  aria-hidden
                  className={
                    thread.unread > 0
                      ? "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-keyblue-600"
                      : "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-transparent"
                  }
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        thread.unread > 0
                          ? "font-bold text-navy-900"
                          : "font-semibold text-navy-900"
                      }
                    >
                      {thread.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${LEAD_STATUS_STYLES[thread.status]}`}
                    >
                      {LEAD_STATUS_LABELS[thread.status]}
                    </span>
                    <span className="text-xs text-navy-700/60">
                      {CHANNEL_LABELS[thread.channel]}
                    </span>
                    {thread.unread > 0 ? (
                      <span className="rounded-full bg-keyblue-600 px-2 py-0.5 text-[0.65rem] font-bold text-white">
                        {thread.unread} new
                      </span>
                    ) : null}
                  </span>

                  {thread.subject ? (
                    <span className="mt-1 block text-xs font-medium text-navy-700">
                      {thread.subject}
                    </span>
                  ) : null}

                  <span className="mt-1 block truncate text-sm text-navy-700/80">
                    {thread.lastDirection === "outbound" ? (
                      <span className="text-navy-700/50">You: </span>
                    ) : null}
                    {thread.preview}
                  </span>
                </span>

                <span className="shrink-0 text-right text-xs text-navy-700/60">
                  {messageTime(thread.lastAt, now)}
                  {thread.total > 1 ? (
                    <span className="mt-1 block">{thread.total} messages</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}

          {visible.length === 0 ? (
            <li className="px-4 py-16 text-center text-sm text-navy-700">
              {active === "unread"
                ? "Nothing unread — you are all caught up."
                : "No messages yet. Enquiries sent from the website land here."}
            </li>
          ) : null}
        </ul>
      </div>
    </Container>
  );
}

function FilterTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white"
          : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-slate-50"
      }
    >
      {label}
      <span className={active ? "ml-1.5 text-white/70" : "ml-1.5 text-navy-700/60"}>
        {count}
      </span>
    </Link>
  );
}
