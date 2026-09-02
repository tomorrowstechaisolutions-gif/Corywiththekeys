"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  Checkbox,
  Field,
  Fieldset,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui/Field";
import type { PartnerLot, Vehicle } from "@/lib/vehicles";
import { STATUS_LABELS } from "@/lib/vehicles";
import {
  TITLE_STATUS_LABELS,
  TITLE_STATUSES,
  VEHICLE_SOURCES,
  VEHICLE_STATUSES,
  WARRANTY_STATUS_LABELS,
  WARRANTY_STATUSES,
} from "@/lib/validation/vehicle";

import type { FormState } from "./actions";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-keyblue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function VehicleForm({
  action,
  vehicle,
  partnerLots,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  vehicle?: Vehicle;
  partnerLots: PartnerLot[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const [source, setSource] = useState(vehicle?.source ?? "owned");

  const err = (field: string) => state.fieldErrors?.[field];
  const locked = new Set(vehicle?.locked_fields ?? []);

  /** Feed-managed vehicles show which columns a sync would otherwise reset. */
  const lockHint = (field: string) =>
    vehicle?.feed_id && locked.has(field)
      ? "Locked — a feed sync will not overwrite this."
      : undefined;

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Saved.
        </p>
      ) : null}

      <Fieldset legend="Vehicle">
        <Field label="Year" htmlFor="year" error={err("year")} hint={lockHint("year")}>
          <TextInput
            id="year"
            name="year"
            inputMode="numeric"
            defaultValue={vehicle?.year ?? ""}
            required
          />
        </Field>
        <Field label="Make" htmlFor="make" error={err("make")} hint={lockHint("make")}>
          <TextInput id="make" name="make" defaultValue={vehicle?.make ?? ""} required />
        </Field>
        <Field label="Model" htmlFor="model" error={err("model")} hint={lockHint("model")}>
          <TextInput id="model" name="model" defaultValue={vehicle?.model ?? ""} required />
        </Field>
        <Field label="Trim" htmlFor="trim" error={err("trim")} hint={lockHint("trim")}>
          <TextInput id="trim" name="trim" defaultValue={vehicle?.trim ?? ""} />
        </Field>
        <Field label="Body type" htmlFor="body_type" error={err("body_type")}>
          <TextInput
            id="body_type"
            name="body_type"
            placeholder="Sedan, SUV, Truck…"
            defaultValue={vehicle?.body_type ?? ""}
          />
        </Field>
        <Field label="Mileage" htmlFor="mileage" error={err("mileage")} hint={lockHint("mileage")}>
          <TextInput
            id="mileage"
            name="mileage"
            inputMode="numeric"
            defaultValue={vehicle?.mileage ?? ""}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Identification">
        <Field
          label="VIN"
          htmlFor="vin"
          error={err("vin")}
          hint={lockHint("vin") ?? "17 characters. Leave blank if you do not have it yet."}
        >
          <TextInput
            id="vin"
            name="vin"
            maxLength={17}
            className="uppercase"
            defaultValue={vehicle?.vin ?? ""}
          />
        </Field>
        <Field label="Stock number" htmlFor="stock_number" error={err("stock_number")}>
          <TextInput
            id="stock_number"
            name="stock_number"
            defaultValue={vehicle?.stock_number ?? ""}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Specification">
        <Field label="Exterior colour" htmlFor="exterior_color" error={err("exterior_color")}>
          <TextInput
            id="exterior_color"
            name="exterior_color"
            defaultValue={vehicle?.exterior_color ?? ""}
          />
        </Field>
        <Field label="Interior colour" htmlFor="interior_color" error={err("interior_color")}>
          <TextInput
            id="interior_color"
            name="interior_color"
            defaultValue={vehicle?.interior_color ?? ""}
          />
        </Field>
        <Field label="Transmission" htmlFor="transmission" error={err("transmission")}>
          <TextInput
            id="transmission"
            name="transmission"
            defaultValue={vehicle?.transmission ?? ""}
          />
        </Field>
        <Field label="Drivetrain" htmlFor="drivetrain" error={err("drivetrain")}>
          <TextInput
            id="drivetrain"
            name="drivetrain"
            placeholder="FWD, AWD, 4WD…"
            defaultValue={vehicle?.drivetrain ?? ""}
          />
        </Field>
        <Field label="Fuel type" htmlFor="fuel_type" error={err("fuel_type")}>
          <TextInput id="fuel_type" name="fuel_type" defaultValue={vehicle?.fuel_type ?? ""} />
        </Field>
        <Field label="Engine" htmlFor="engine" error={err("engine")}>
          <TextInput id="engine" name="engine" defaultValue={vehicle?.engine ?? ""} />
        </Field>
        <Field label="Cylinders" htmlFor="cylinders" error={err("cylinders")}>
          <TextInput
            id="cylinders"
            name="cylinders"
            inputMode="numeric"
            defaultValue={vehicle?.cylinders ?? ""}
          />
        </Field>
        <Field label="Doors" htmlFor="doors" error={err("doors")}>
          <TextInput
            id="doors"
            name="doors"
            inputMode="numeric"
            defaultValue={vehicle?.doors ?? ""}
          />
        </Field>
        <Field label="Seats" htmlFor="seating" error={err("seating")}>
          <TextInput
            id="seating"
            name="seating"
            inputMode="numeric"
            defaultValue={vehicle?.seating ?? ""}
          />
        </Field>
        <Field label="MPG city" htmlFor="mpg_city" error={err("mpg_city")}>
          <TextInput
            id="mpg_city"
            name="mpg_city"
            inputMode="numeric"
            defaultValue={vehicle?.mpg_city ?? ""}
          />
        </Field>
        <Field label="MPG highway" htmlFor="mpg_highway" error={err("mpg_highway")}>
          <TextInput
            id="mpg_highway"
            name="mpg_highway"
            inputMode="numeric"
            defaultValue={vehicle?.mpg_highway ?? ""}
          />
        </Field>
      </Fieldset>

      <Fieldset
        legend="Disclosures"
        description="What the buyer is entitled to know. A vehicle cannot be published while the title is still unanswered."
        columns={2}
      >
        <Field
          label="Title status"
          htmlFor="title_status"
          error={err("title_status")}
          hint={lockHint("title_status") ?? "Required before this listing can go live."}
        >
          <Select
            id="title_status"
            name="title_status"
            defaultValue={vehicle?.title_status ?? "not_disclosed"}
          >
            {TITLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {TITLE_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Vehicle history report"
          htmlFor="history_report_url"
          error={err("history_report_url")}
          hint="Carfax or AutoCheck link. Shows as a button on the listing."
        >
          <TextInput
            id="history_report_url"
            name="history_report_url"
            inputMode="url"
            placeholder="https://www.carfax.com/VehicleHistory/..."
            defaultValue={vehicle?.history_report_url ?? ""}
          />
        </Field>

        <Field label="Warranty" htmlFor="warranty_status" error={err("warranty_status")}>
          <Select
            id="warranty_status"
            name="warranty_status"
            defaultValue={vehicle?.warranty_status ?? "not_specified"}
          >
            {WARRANTY_STATUSES.map((value) => (
              <option key={value} value={value}>
                {WARRANTY_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Warranty details"
          htmlFor="warranty_details"
          error={err("warranty_details")}
          hint="Optional. Term, mileage limit, what it covers."
        >
          <TextInput
            id="warranty_details"
            name="warranty_details"
            defaultValue={vehicle?.warranty_details ?? ""}
          />
        </Field>

        <Field
          label="Walkaround video"
          htmlFor="video_url"
          error={err("video_url")}
          hint="YouTube link. Plays on the listing above the specs."
          className="sm:col-span-2"
        >
          <TextInput
            id="video_url"
            name="video_url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={vehicle?.video_url ?? ""}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Pricing" columns={3}>
        <Field
          label="Price"
          htmlFor="price"
          error={err("price")}
          hint={lockHint("price") ?? "Required before you can publish."}
        >
          <TextInput
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="21991"
            defaultValue={vehicle?.price ?? ""}
          />
        </Field>
        <Field
          label="Monthly payment"
          htmlFor="monthly_payment"
          error={err("monthly_payment")}
          hint={lockHint("monthly_payment") ?? "Estimate shown on the card."}
        >
          <TextInput
            id="monthly_payment"
            name="monthly_payment"
            inputMode="decimal"
            defaultValue={vehicle?.monthly_payment ?? ""}
          />
        </Field>
        <Field label="Down payment" htmlFor="down_payment" error={err("down_payment")}>
          <TextInput
            id="down_payment"
            name="down_payment"
            inputMode="decimal"
            defaultValue={vehicle?.down_payment ?? ""}
          />
        </Field>
      </Fieldset>

      <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-navy-900">Listing copy</legend>
        <div className="grid gap-4">
          <Field label="Description" htmlFor="description" error={err("description")}>
            <TextArea
              id="description"
              name="description"
              rows={5}
              defaultValue={vehicle?.description ?? ""}
            />
          </Field>
          <Field
            label="Features"
            htmlFor="features"
            error={err("features")}
            hint="One per line, or separated by commas."
          >
            <TextArea
              id="features"
              name="features"
              rows={3}
              defaultValue={(vehicle?.features ?? []).join("\n")}
            />
          </Field>
        </div>
      </fieldset>

      <Fieldset
        legend="Source"
        description="Where this vehicle comes from. Partner units must be attributed to a lot."
        columns={2}
      >
        <Field label="Owned or partner" htmlFor="source" error={err("source")}>
          <Select
            id="source"
            name="source"
            value={source}
            onChange={(event) =>
              setSource(event.target.value as typeof source)
            }
          >
            {VEHICLE_SOURCES.map((value) => (
              <option key={value} value={value}>
                {value === "owned" ? "Owned by The Key Konnect" : "Partner lot"}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Partner lot"
          htmlFor="partner_lot_id"
          error={err("partner_lot_id")}
          hint={
            partnerLots.length === 0 ? (
              <>
                No partner lots yet.{" "}
                <Link href="/admin/partner-lots" className="underline">
                  Add one
                </Link>
                .
              </>
            ) : undefined
          }
        >
          <Select
            id="partner_lot_id"
            name="partner_lot_id"
            defaultValue={vehicle?.partner_lot_id ?? ""}
            disabled={source !== "partner"}
          >
            <option value="">— none —</option>
            {partnerLots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </Select>
        </Field>
      </Fieldset>

      <Fieldset legend="Publishing" columns={2}>
        <Field
          label="Status"
          htmlFor="status"
          error={err("status")}
          hint={lockHint("status") ?? "Available and Sale pending show on the public site."}
        >
          <Select id="status" name="status" defaultValue={vehicle?.status ?? "draft"}>
            {VEHICLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-end pb-2">
          <Checkbox
            name="is_featured"
            defaultChecked={vehicle?.is_featured ?? false}
            label="Feature on the homepage"
            description="Shows in the featured rail. A feed sync never changes this."
          />
        </div>
      </Fieldset>

      <div className="flex items-center gap-3">
        <SaveButton label={submitLabel} />
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
