"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { Vehicle } from "@/lib/vehicles";

import type { IntakeState } from "../actions";

const FIELD =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-navy-900 outline-none transition focus:border-keyblue-500 focus:ring-2 focus:ring-keyblue-500/25";

function Field({
  label,
  name,
  defaultValue,
  error,
  hint,
  required,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  error?: string;
  hint?: string;
  required?: boolean;
  inputMode?: "numeric" | "text";
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wider text-navy-700"
      >
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={FIELD}
      />
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-navy-700/70">{hint}</p>
      ) : null}
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save details"}
    </button>
  );
}

/**
 * The details step, sized for one thumb on a phone.
 *
 * Everything the VIN lookup already answered is pre-filled and editable —
 * shown rather than hidden, because vPIC gets trim wrong often enough that a
 * person standing at the car should be able to correct it.
 */
export function IntakeForm({
  vehicle,
  action,
  decodeFailed,
}: {
  vehicle: Vehicle;
  action: (state: IntakeState, formData: FormData) => Promise<IntakeState>;
  decodeFailed: boolean;
}) {
  const [state, formAction] = useActionState<IntakeState, FormData>(action, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} noValidate className="space-y-4">
      {decodeFailed ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          The VIN lookup did not answer, so nothing was filled in for you. Type
          what you can read off the car — a reviewer can finish the rest.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800"
        >
          {state.notice ?? "Saved."}
        </p>
      ) : null}

      <Field
        label="Mileage"
        name="mileage"
        defaultValue={vehicle.mileage}
        error={err("mileage")}
        required
        inputMode="numeric"
        placeholder="e.g. 84200"
        hint="Read it off the dash. Required before you can send this in."
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Year"
          name="year"
          defaultValue={vehicle.year}
          error={err("year")}
          inputMode="numeric"
        />
        <Field
          label="Make"
          name="make"
          defaultValue={vehicle.make}
          error={err("make")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Model"
          name="model"
          defaultValue={vehicle.model}
          error={err("model")}
          required
        />
        <Field label="Trim" name="trim" defaultValue={vehicle.trim} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Outside color"
          name="exterior_color"
          defaultValue={vehicle.exterior_color}
          placeholder="e.g. Silver"
        />
        <Field
          label="Inside color"
          name="interior_color"
          defaultValue={vehicle.interior_color}
          placeholder="e.g. Black"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Body"
          name="body_type"
          defaultValue={vehicle.body_type}
        />
        <Field
          label="Stock number"
          name="stock_number"
          defaultValue={vehicle.stock_number}
        />
      </div>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">
          Engine and drivetrain
        </summary>
        <div className="mt-3 space-y-3">
          <Field label="Engine" name="engine" defaultValue={vehicle.engine} />
          <Field
            label="Transmission"
            name="transmission"
            defaultValue={vehicle.transmission}
          />
          <Field
            label="Drivetrain"
            name="drivetrain"
            defaultValue={vehicle.drivetrain}
          />
          <Field
            label="Fuel"
            name="fuel_type"
            defaultValue={vehicle.fuel_type}
          />
        </div>
      </details>

      <Field
        label="Asking price"
        name="price"
        defaultValue={vehicle.price}
        error={err("price")}
        inputMode="numeric"
        placeholder="Leave blank if Cory sets it"
        hint="Optional. A reviewer must set a price before it can go live."
      />

      <div>
        <label
          htmlFor="description"
          className="text-xs font-semibold uppercase tracking-wider text-navy-700"
        >
          Anything worth noting
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={vehicle.description ?? ""}
          placeholder="Dents, warning lights, a missing key, new tires…"
          className={FIELD}
        />
        <p className="mt-1 text-xs text-navy-700/70">
          Whatever a reviewer would want to know before pricing it.
        </p>
      </div>

      <SaveButton />
    </form>
  );
}
