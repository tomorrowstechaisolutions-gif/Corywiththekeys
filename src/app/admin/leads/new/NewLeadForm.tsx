"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import {
  LEAD_SOURCE_LABELS,
  MANUAL_LEAD_SOURCES,
  addDaysISO,
  todayISO,
} from "@/lib/leads";

import { createLead, type LeadState } from "../actions";
import type { StaffOption } from "../[id]/LeadControls";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Add lead"}
    </button>
  );
}

export function NewLeadForm({
  staff,
  currentUserId,
}: {
  staff: StaffOption[];
  currentUserId: string;
}) {
  const [state, action] = useActionState<LeadState, FormData>(createLead, {});
  // Defaulted to tomorrow, because the commonest reason a walk-in is never
  // seen again is that nobody picked a day to call them.
  const [followUp, setFollowUp] = useState(addDaysISO(1));

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form
      action={action}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      {state.error ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={err("firstName")}>
          <TextInput id="firstName" name="firstName" autoComplete="off" />
        </Field>

        <Field label="Last name" htmlFor="lastName" error={err("lastName")}>
          <TextInput id="lastName" name="lastName" autoComplete="off" />
        </Field>

        <Field
          label="Phone"
          htmlFor="phone"
          error={err("phone")}
          hint="A phone number or an email — one of the two is needed."
        >
          <TextInput id="phone" name="phone" inputMode="tel" autoComplete="off" />
        </Field>

        <Field label="Email" htmlFor="email" error={err("email")}>
          <TextInput id="email" name="email" type="email" autoComplete="off" />
        </Field>

        <Field
          label="How did they reach you"
          htmlFor="source"
          error={err("source")}
          hint="Website enquiries add themselves, so they are not in this list."
        >
          <Select id="source" name="source" defaultValue="walk_in">
            {MANUAL_LEAD_SOURCES.map((value) => (
              <option key={value} value={value}>
                {LEAD_SOURCE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Owner" htmlFor="assignedTo" error={err("assignedTo")}>
          <Select id="assignedTo" name="assignedTo" defaultValue={currentUserId}>
            <option value="">Nobody</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="What are they after"
          htmlFor="message"
          error={err("message")}
          className="sm:col-span-2"
        >
          <TextArea
            id="message"
            name="message"
            rows={3}
            placeholder="Truck under $20k, has a trade, works nights."
          />
        </Field>

        <Field
          label="Chase them on"
          htmlFor="followUpAt"
          error={err("followUpAt")}
          className="sm:col-span-2"
        >
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <TextInput
              id="followUpAt"
              name="followUpAt"
              type="date"
              className="mt-0 w-auto"
              min={todayISO()}
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
            />
            {[
              { label: "Tomorrow", value: addDaysISO(1) },
              { label: "In 3 days", value: addDaysISO(3) },
              { label: "Next week", value: addDaysISO(7) },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setFollowUp(option.value)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:border-keyblue-500"
              >
                {option.label}
              </button>
            ))}
            {followUp ? (
              <button
                type="button"
                onClick={() => setFollowUp("")}
                className="text-xs font-medium text-navy-700 underline"
              >
                No follow-up
              </button>
            ) : null}
          </div>
        </Field>
      </div>

      <div className="mt-5">
        <SaveButton />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-navy-700/70">
        Saved as <strong>Contacted</strong> — you have already spoken to them,
        which is how you know about them.
      </p>
    </form>
  );
}
