import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES, leadName } from "@/lib/leads";
import { CHANNEL_LABELS, messageStamp } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

import { markThreadRead, sendReply } from "../actions";
import { ReplyForm } from "./ReplyForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

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

  return { title: data ? leadName(data) : "Conversation" };
}

export default async function MessageThreadPage({ params }: PageProps) {
  const profile = await requireSection("messages");
  const { id } = await params;

  const supabase = await createClient();

  const [leadResult, messagesResult, staffResult] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .eq("lead_id", id)
      .order("sent_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  if (!leadResult.data) notFound();

  const lead = leadResult.data;
  const messages = messagesResult.data ?? [];
  const editable = canWrite(profile);

  const authors = new Map(
    (staffResult.data ?? []).map((s) => [s.id, s.full_name?.trim() || s.email]),
  );

  // Reading the thread is what clears the unread state.
  if (messages.some((m) => m.direction === "inbound" && !m.read_at)) {
    await markThreadRead(id);
  }

  const contactHint =
    [lead.phone, lead.email].filter(Boolean).join(" or ") || null;

  return (
    <Container className="py-8">
      <Link
        href="/admin/messages"
        className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
      >
        ← Back to messages
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{leadName(lead)}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${LEAD_STATUS_STYLES[lead.status]}`}
            >
              {LEAD_STATUS_LABELS[lead.status]}
            </span>
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="font-medium text-keyblue-600 hover:underline"
              >
                {lead.phone}
              </a>
            ) : null}
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="font-medium text-keyblue-600 hover:underline"
              >
                {lead.email}
              </a>
            ) : null}
          </div>
        </div>

        <Link
          href={`/admin/leads/${lead.id}`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
        >
          Open lead record
        </Link>
      </div>

      <ol className="mt-6 space-y-3">
        {messages.map((message) => {
          const inbound = message.direction === "inbound";

          return (
            <li
              key={message.id}
              className={inbound ? "flex justify-start" : "flex justify-end"}
            >
              <div
                className={
                  inbound
                    ? "max-w-[42rem] rounded-lg rounded-tl-sm border border-slate-200 bg-white p-4"
                    : "max-w-[42rem] rounded-lg rounded-tr-sm border border-keyblue-200 bg-keyblue-50 p-4"
                }
              >
                <p className="text-xs font-semibold text-navy-700">
                  {inbound
                    ? leadName(lead)
                    : (message.author_id && authors.get(message.author_id)) ||
                      "Staff"}
                  <span className="ml-2 font-normal text-navy-700/60">
                    {CHANNEL_LABELS[message.channel]} ·{" "}
                    {messageStamp(message.sent_at)}
                  </span>
                </p>

                {message.subject ? (
                  <p className="mt-1.5 text-xs font-medium text-navy-700/70">
                    {message.subject}
                  </p>
                ) : null}

                <p className="mt-2 whitespace-pre-wrap text-sm text-navy-900">
                  {message.body}
                </p>
              </div>
            </li>
          );
        })}

        {messages.length === 0 ? (
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-12 text-center text-sm text-navy-700">
            This lead has no messages — it was typed in by hand rather than sent
            from the website.
          </li>
        ) : null}
      </ol>

      {editable ? (
        <div className="mt-6 max-w-3xl">
          <ReplyForm
            action={sendReply.bind(null, lead.id)}
            contactHint={contactHint}
          />
        </div>
      ) : (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You are signed in as a viewer, so this conversation is read-only.
        </p>
      )}
    </Container>
  );
}
