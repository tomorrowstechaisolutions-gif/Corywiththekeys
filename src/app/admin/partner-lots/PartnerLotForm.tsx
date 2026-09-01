"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Checkbox, Field, TextArea, TextInput } from "@/components/ui/Field";

import { createPartnerLot, type FormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Add partner lot"}
    </button>
  );
}

export function PartnerLotForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createPartnerLot,
    {},
  );

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <h2 className="text-sm font-bold text-navy-900">Add a partner lot</h2>
      <p className="mt-1 text-xs text-navy-700">
        Any dealer or lot supplying vehicles. Feed imports are attached to a lot
        later — a lot entered by hand needs no feed.
      </p>

      {state.error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Partner lot added.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Lot name" htmlFor="name" error={err("name")}>
          <TextInput id="name" name="name" required />
        </Field>
        <Field label="Contact name" htmlFor="contact_name" error={err("contact_name")}>
          <TextInput id="contact_name" name="contact_name" />
        </Field>
        <Field label="Contact phone" htmlFor="contact_phone" error={err("contact_phone")}>
          <TextInput id="contact_phone" name="contact_phone" type="tel" />
        </Field>
        <Field label="Contact email" htmlFor="contact_email" error={err("contact_email")}>
          <TextInput id="contact_email" name="contact_email" type="email" />
        </Field>
        <Field label="Address" htmlFor="address_line1" error={err("address_line1")}>
          <TextInput id="address_line1" name="address_line1" />
        </Field>
        <Field label="City" htmlFor="city" error={err("city")}>
          <TextInput id="city" name="city" />
        </Field>
        <Field label="State" htmlFor="state" error={err("state")}>
          <TextInput id="state" name="state" maxLength={2} placeholder="TX" />
        </Field>
        <Field label="Postal code" htmlFor="postal_code" error={err("postal_code")}>
          <TextInput id="postal_code" name="postal_code" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4">
        <Field
          label="Commission terms"
          htmlFor="commission_notes"
          error={err("commission_notes")}
          hint="Free text for now — split, flat fee, whatever you agreed."
        >
          <TextArea id="commission_notes" name="commission_notes" rows={2} />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <Checkbox
          name="is_active"
          defaultChecked
          label="Active"
          description="Inactive lots stay on file but cannot be assigned."
        />
        <Checkbox
          name="display_on_site"
          label="Credit publicly"
          description="Show this lot's name on listings on the public site."
        />
      </div>

      <div className="mt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
