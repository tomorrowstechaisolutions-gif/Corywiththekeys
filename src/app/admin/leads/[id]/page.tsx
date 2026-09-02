import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UpgradeNote } from "@/components/admin/UpgradeNote";
import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import {
  ATTENTION_STYLES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  attention,
  leadName,
  timeAgo,
  type Lead,
  type LeadEvent,
} from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";
import { vehicleTitle } from "@/lib/vehicles";

import {
  AssignControl,
  FollowUpControl,
  LogContactCard,
  NoteForm,
  StatusControl,
  type StaffOption,
} from "./LeadControls";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("first_name, last_name, email, phone")
    .eq("id", id)
    .maybeSingle();

  return { title: data ? leadName(data) : "Lead" };
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: PageProps) {
  const profile = await requireSection("leads");
  const { id } = await params;
  const { created } = await searchParams;

  const supabase = await createClient();

  const [leadResult, eventsResult, staffResult] = await Promise.all([
    supabase
      .from("leads")
      .select("*, vehicles(id, slug, year, make, model, trim)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lead_events")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("is_active", true)
      .in("role", ["owner", "admin", "sales"])
      .order("full_name"),
  ]);

  if (!leadResult.data) notFound();

  const lead = leadResult.data as Lead & {
    vehicles: {
      id: string;
      slug: string;
      year: number;
      make: string;
      model: string;
      trim: string | null;
    } | null;
  };

  const events = (eventsResult.data ?? []) as LeadEvent[];

  const staff: StaffOption[] = (staffResult.data ?? []).map((s) => ({
    id: s.id,
    name: s.full_name?.trim() || s.email,
  }));

  const authors = new Map(staff.map((s) => [s.id, s.name]));
  const now = new Date();
  const flag = attention(lead, now);
  const editable = canWrite(profile);

  return (
    <Container className="py-8">
      <Link
        href="/admin/leads"
        className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
      >
        ← Back to leads
      </Link>

      {created ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Lead added. Set a day to chase them so it does not slip.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            {leadName(lead)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEAD_STATUS_STYLES[lead.status]}`}
            >
              {LEAD_STATUS_LABELS[lead.status]}
            </span>
            {flag.kind !== "none" ? (
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${ATTENTION_STYLES[flag.kind]}`}
              >
                {flag.label}
              </span>
            ) : null}
            <span className="text-xs text-navy-700">
              Came in {timeAgo(lead.created_at, now)} via{" "}
              {LEAD_SOURCE_LABELS[lead.source]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {lead.phone ? (
            <>
              <a
                href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                className="rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-keyblue-500"
              >
                Call {lead.phone}
              </a>
              <a
                href={`sms:${lead.phone.replace(/[^\d+]/g, "")}`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-slate-50"
              >
                Text
              </a>
            </>
          ) : null}
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-slate-50"
            >
              Email
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {editable ? <LogContactCard lead={lead} /> : null}

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-navy-900">
              What they asked for
            </h2>

            {lead.message ? (
              <p className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-navy-900">
                {lead.message}
              </p>
            ) : (
              <p className="mt-3 text-sm text-navy-700/70">
                Nothing written — this one came in without a message.
              </p>
            )}

            {lead.vehicles ? (
              <p className="mt-4 text-sm text-navy-700">
                About{" "}
                <Link
                  href={`/admin/inventory/${lead.vehicles.id}`}
                  className="font-semibold text-keyblue-600 hover:underline"
                >
                  {vehicleTitle(lead.vehicles)}
                </Link>
              </p>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-navy-900">History</h2>
            <p className="mt-1 text-sm text-navy-700">
              Everything that has happened, newest first. Written
              automatically — nobody has to remember to log a stage change.
            </p>

            {editable ? <NoteForm leadId={lead.id} /> : null}

            <ol className="mt-5 space-y-4 border-l border-slate-200 pl-5">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300"
                  />
                  <p className="text-sm text-navy-900">
                    <EventBody event={event} />
                  </p>
                  <p className="mt-0.5 text-xs text-navy-700/70">
                    {timeAgo(event.created_at, now)}
                    {event.author_id
                      ? ` · ${authors.get(event.author_id) ?? "a colleague"}`
                      : ""}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-navy-900">Details</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Detail label="Phone" value={lead.phone} />
              <Detail label="Email" value={lead.email} />
              <Detail
                label="Prefers"
                value={
                  lead.preferred_contact === "any"
                    ? "No preference"
                    : lead.preferred_contact
                }
              />
              <Detail
                label="First contacted"
                value={
                  lead.contacted_at
                    ? timeAgo(lead.contacted_at, now)
                    : "Never — nobody has replied"
                }
              />
            </dl>
          </section>

          {editable ? (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
              <StatusControl lead={lead} />
              <AssignControl lead={lead} staff={staff} />
              <FollowUpControl lead={lead} />
            </section>
          ) : (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Your role can read leads but not change them.
            </p>
          )}

          <UpgradeNote
            title="Texts and emails still go out from your own phone."
            body="Nothing here sends a message. Calling and texting open your phone, and this screen records that you did. A connected version would send from the business number, keep both sides of the conversation on this page, and chase the follow-up itself if nobody gets to it."
          />
        </aside>
      </div>
    </Container>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-navy-700">{label}</dt>
      <dd className="text-right font-medium text-navy-900">
        {value ?? <span className="text-navy-700/50">—</span>}
      </dd>
    </div>
  );
}

/** One line of history, in words rather than field names. */
function EventBody({ event }: { event: LeadEvent }) {
  if (event.type === "status_change") {
    if (event.body) return <>{event.body}</>;
    return (
      <>
        Moved from{" "}
        <strong>
          {event.from_status ? LEAD_STATUS_LABELS[event.from_status] : "nothing"}
        </strong>{" "}
        to{" "}
        <strong>
          {event.to_status ? LEAD_STATUS_LABELS[event.to_status] : "nothing"}
        </strong>
      </>
    );
  }

  if (event.type === "note") {
    return <span className="whitespace-pre-wrap">{event.body}</span>;
  }

  return <>{event.body}</>;
}
