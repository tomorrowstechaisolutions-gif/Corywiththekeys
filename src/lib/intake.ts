import type { Database } from "@/types/database";

export type IntakeStatus = Database["public"]["Enums"]["intake_status"];

export const INTAKE_LABELS: Record<IntakeStatus, string> = {
  in_progress: "Being captured",
  pending: "Needs review",
  approved: "Approved",
  returned: "Sent back",
};

export const INTAKE_STYLES: Record<IntakeStatus, string> = {
  in_progress: "bg-slate-200 text-slate-700",
  pending: "bg-gold-600 text-white",
  approved: "bg-emerald-600 text-white",
  returned: "bg-amber-100 text-amber-900",
};

/**
 * What a person on the lot must capture before they can submit.
 *
 * Deliberately short. Price and description are a desk job — asking for them
 * in a parking lot in July is how a half-finished intake gets abandoned.
 */
export const INTAKE_REQUIREMENTS = [
  "A VIN",
  "Current mileage",
  "At least one photo",
] as const;
