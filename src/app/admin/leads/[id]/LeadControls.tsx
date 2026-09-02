"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, addDaysISO } from "@/lib/leads";
import type { Lead } from "@/lib/leads";

import {
  addNote,
  assignLead,
  logContact,
  setFollowUp,
  setLeadStatus,
  type LeadState,
} from "../actions";

const EMPTY: LeadState = {};

export type StaffOption = { id: string; name: string };

function Saving({ label, small = false }: { label: string; small?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        small
          ? "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-slate-50 disabled:opacity-60"
          : "rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Result({ state }: { state: LeadState }) {
  if (state.error) {
    return (
      <p role="alert" className="mt-2 text-xs text-red-700">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="mt-2 text-xs text-emerald-700">
        {state.message}
      </p>
    );
  }
  return null;
}

/**
 * "I just spoke to them."
 *
 * The follow-up date sits inside this form rather than beside it because the
 * moment somebody puts the phone down is the only moment they will reliably
 * set one. The quick buttons exist for the same reason — a date picker is
 * three taps and "tomorrow" is one.
 */
export function LogContactCard({ lead }: { lead: Lead }) {
  const [state, action] = useActionState<LeadState, FormData>(
    logContact,
    EMPTY,
  );
  const [followUp, setFollowUpValue] = useState(lead.next_follow_up_at ?? "");

  const quick = [
    { label: "Tomorrow", value: addDaysISO(1) },
    { label: "In 3 days", value: addDaysISO(3) },
    { label: "Next week", value: addDaysISO(7) },
  ];

  return (
    <form
      action={action}
      className="rounded-lg border border-keyblue-600/30 bg-keyblue-600/5 p-5"
    >
      <input type="hidden" name="id" value={lead.id} />

      <h2 className="text-base font-bold text-navy-900">Log a conversation</h2>
      <p className="mt-1 text-sm text-navy-700">
        Anything that happened off the system — a call, a text, they came in.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[10rem_1fr]">
        <Field label="What happened" htmlFor="channel">
          <Select id="channel" name="channel" defaultValue="phone">
            <option value="phone">Called</option>
            <option value="sms">Texted</option>
            <option value="email">Emailed</option>
            <option value="in_person">Came in</option>
          </Select>
        </Field>

        <Field
          label="How did it go"
          htmlFor="contact-body"
          hint="Optional, but the next person to pick this up will thank you."
        >
          <TextArea
            id="contact-body"
            name="body"
            rows={2}
            placeholder="Wants something under $15k, working nights so call after 4."
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Chase them again on"
          htmlFor="contact-followup"
          error={state.fieldErrors?.followUpAt}
        >
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <TextInput
              id="contact-followup"
              name="followUpAt"
              type="date"
              className="mt-0 w-auto"
              // Deliberately no `min`. This field starts on whatever date was
              // already promised, and on an overdue lead that date is in the
              // past — a min would mark the form invalid and refuse to submit
              // on exactly the leads that most need logging.
              value={followUp}
              onChange={(event) => setFollowUpValue(event.target.value)}
            />
            {quick.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setFollowUpValue(option.value)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:border-keyblue-500"
              >
                {option.label}
              </button>
            ))}
            {followUp ? (
              <button
                type="button"
                onClick={() => setFollowUpValue("")}
                className="text-xs font-medium text-navy-700 underline"
              >
                Clear
              </button>
            ) : null}
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Saving label="Log it" />
      </div>
      <Result state={state} />
    </form>
  );
}

export function StatusControl({ lead }: { lead: Lead }) {
  const [state, action] = useActionState<LeadState, FormData>(
    setLeadStatus,
    EMPTY,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={lead.id} />
      <Field label="Stage" htmlFor={`status-${lead.id}`}>
        <div className="mt-1 flex gap-2">
          <Select
            id={`status-${lead.id}`}
            name="status"
            defaultValue={lead.status}
            className="mt-0"
          >
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
          <Saving label="Set" small />
        </div>
      </Field>
      <Result state={state} />
    </form>
  );
}

export function AssignControl({
  lead,
  staff,
}: {
  lead: Lead;
  staff: StaffOption[];
}) {
  const [state, action] = useActionState<LeadState, FormData>(
    assignLead,
    EMPTY,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={lead.id} />
      <Field label="Owner" htmlFor={`owner-${lead.id}`}>
        <div className="mt-1 flex gap-2">
          <Select
            id={`owner-${lead.id}`}
            name="assignedTo"
            defaultValue={lead.assigned_to ?? ""}
            className="mt-0"
          >
            <option value="">Nobody</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
          <Saving label="Set" small />
        </div>
      </Field>
      <Result state={state} />
    </form>
  );
}

export function FollowUpControl({ lead }: { lead: Lead }) {
  const [state, action] = useActionState<LeadState, FormData>(
    setFollowUp,
    EMPTY,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={lead.id} />
      <Field
        label="Follow up on"
        htmlFor={`followup-${lead.id}`}
        error={state.fieldErrors?.followUpAt}
      >
        <div className="mt-1 flex gap-2">
          <TextInput
            id={`followup-${lead.id}`}
            name="followUpAt"
            type="date"
            className="mt-0"
            defaultValue={lead.next_follow_up_at ?? ""}
          />
          <Saving label="Set" small />
        </div>
      </Field>
      <Result state={state} />
    </form>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action] = useActionState<LeadState, FormData>(addNote, EMPTY);

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="id" value={leadId} />
      <Field
        label="Add a note"
        htmlFor={`note-${leadId}`}
        error={state.fieldErrors?.body}
      >
        <TextArea
          id={`note-${leadId}`}
          name="body"
          rows={3}
          placeholder="Anything the next person should know."
        />
      </Field>
      <div className="mt-3">
        <Saving label="Add note" small />
      </div>
      <Result state={state} />
    </form>
  );
}
