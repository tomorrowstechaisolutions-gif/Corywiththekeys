import type { Metadata } from "next";
import Link from "next/link";

import { LeadTable } from "@/components/admin/LeadTable";
import { UpgradeNote } from "@/components/admin/UpgradeNote";
import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import {
  attentionRank,
  isOpen,
  type Lead,
} from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Leads" };

/** Follow-up dates are compared against today, so never serve this stale. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  view?: string;
  owner?: string;
  q?: string;
}>;

const VIEWS = [
  { key: "attention", label: "Needs attention" },
  { key: "open", label: "All open" },
  { key: "mine", label: "Mine" },
  { key: "won", label: "Sold" },
  { key: "lost", label: "Lost" },
  { key: "all", label: "Everything" },
] as const;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireSection("leads");
  const { view = "attention", q } = await searchParams;

  const supabase = await createClient();

  /*
   * Everything is fetched and ordered here rather than in SQL.
   *
   * "Needs attention" is not a column — it is a small rule over the follow-up
   * date, the status and whether anybody has ever replied. Expressing that as
   * an ORDER BY would bake the rule into a string nobody can test. A lot this
   * size will not see the volume where that matters, and if it ever does, the
   * fix is an index and a view, not a cleverer query today.
   */
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const all = (data ?? []) as Lead[];

  const staffIds = [...new Set(all.map((l) => l.assigned_to).filter(Boolean))];
  const { data: staff } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", staffIds.length > 0 ? (staffIds as string[]) : ["-"]);

  const owners = new Map(
    (staff ?? []).map((s) => [s.id, s.full_name?.trim() || s.email]),
  );

  const now = new Date();

  const term = q?.trim().toLowerCase();
  const matchesSearch = (lead: Lead) =>
    !term ||
    [lead.first_name, lead.last_name, lead.email, lead.phone, lead.message]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));

  const needsAttention = (lead: Lead) => attentionRank(lead, now) < 300;

  const filtered = all.filter((lead) => {
    if (!matchesSearch(lead)) return false;

    switch (view) {
      case "attention":
        return needsAttention(lead);
      case "open":
        return isOpen(lead.status);
      case "mine":
        return lead.assigned_to === profile.id && isOpen(lead.status);
      case "won":
        return lead.status === "won";
      case "lost":
        return lead.status === "lost";
      default:
        return true;
    }
  });

  const sorted = [...filtered].sort((a, b) => {
    const rank = attentionRank(a, now) - attentionRank(b, now);
    if (rank !== 0) return rank;
    // Within a band, the one nobody has touched for longest goes first.
    return (
      new Date(a.last_activity_at).getTime() -
      new Date(b.last_activity_at).getTime()
    );
  });

  const counts = {
    attention: all.filter(needsAttention).length,
    open: all.filter((l) => isOpen(l.status)).length,
    mine: all.filter((l) => l.assigned_to === profile.id && isOpen(l.status))
      .length,
    won: all.filter((l) => l.status === "won").length,
    lost: all.filter((l) => l.status === "lost").length,
    all: all.length,
  };

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Leads</h1>
          <p className="mt-1 text-sm text-navy-700">
            {counts.attention === 0
              ? "Nothing is overdue. Everybody has been followed up."
              : `${counts.attention} need${counts.attention === 1 ? "s" : ""} attention right now.`}
          </p>
        </div>

        {canWrite(profile) ? (
          <Link
            href="/admin/leads/new"
            className="rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500"
          >
            Add a lead
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {VIEWS.map((option) => {
          const active = view === option.key;
          const href =
            option.key === "attention"
              ? "/admin/leads"
              : `/admin/leads?view=${option.key}`;

          return (
            <Link
              key={option.key}
              href={href}
              className={
                active
                  ? "rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-navy-700 hover:border-keyblue-500"
              }
            >
              {option.label}
              <span className="ml-1.5 opacity-60">{counts[option.key]}</span>
            </Link>
          );
        })}
      </div>

      <form className="mt-4 flex gap-2" action="/admin/leads">
        {view !== "attention" ? (
          <input type="hidden" name="view" value={view} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, phone, email or what they wrote"
          className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load leads.
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState view={view} searched={Boolean(term)} total={counts.all} />
      ) : (
        <div className="mt-6">
          <LeadTable leads={sorted} owners={owners} now={now} />
        </div>
      )}

      <div className="mt-6">
        <UpgradeNote
          title="This list tells you who to chase. It does not chase them."
          body="Right now somebody has to open this page for a follow-up to happen. The next step up sends the reminder to whoever owns the lead, texts the customer automatically when a promise is missed, and reports on how many enquiries turn into sales by source and by salesperson."
        />
      </div>

      <p className="mt-4 text-xs text-navy-700/60">
        Showing the {Math.min(counts.all, 500)} most recent enquiries.
        {counts.all >= 500
          ? " Older ones are still stored and still counted — say the word and I'll add paging."
          : ""}
      </p>
    </Container>
  );
}

function EmptyState({
  view,
  searched,
  total,
}: {
  view: string;
  searched: boolean;
  total: number;
}) {
  if (searched) {
    return (
      <p className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-navy-700">
        Nothing matched that search.
      </p>
    );
  }

  if (total === 0) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-navy-900">No leads yet.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy-700">
          Every enquiry from the website lands here on its own — the contact
          form, financing, and the &ldquo;check availability&rdquo; button on a
          vehicle. Walk-ins and phone calls you add yourself.
        </p>
        <Link
          href="/admin/leads/new"
          className="mt-5 inline-block rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500"
        >
          Add the first one
        </Link>
      </div>
    );
  }

  return (
    <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-10 text-center text-sm text-emerald-900">
      {view === "attention"
        ? "Nothing needs chasing. Everybody has been followed up."
        : "Nothing here."}
    </p>
  );
}
