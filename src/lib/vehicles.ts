import type { Database } from "@/types/database";
import { slugify } from "@/lib/utils";

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehiclePhoto = Database["public"]["Tables"]["vehicle_photos"]["Row"];
export type PartnerLot = Database["public"]["Tables"]["partner_lots"]["Row"];
export type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];
export type VehicleSource = Database["public"]["Enums"]["vehicle_source"];
export type IngestionMethod = Database["public"]["Enums"]["ingestion_method"];

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  draft: "Draft",
  available: "Available",
  pending: "Sale pending",
  sold: "Sold",
  archived: "Archived",
};

/** Tailwind classes for the status pill. */
export const STATUS_STYLES: Record<VehicleStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  available: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-900",
  sold: "bg-keyblue-600/10 text-keyblue-700",
  archived: "bg-slate-200 text-slate-600",
};

export const SOURCE_LABELS: Record<VehicleSource, string> = {
  owned: "Owned",
  partner: "Partner lot",
};

export const INGESTION_LABELS: Record<IngestionMethod, string> = {
  manual: "Entered by hand",
  csv_import: "CSV import",
  xml_feed: "XML feed",
  json_api: "JSON API",
  partner_api: "Partner API",
};

/** Statuses that make a vehicle visible on the public site. */
export const PUBLIC_STATUSES: readonly VehicleStatus[] = ["available", "pending"];

export function vehicleTitle(
  v: Pick<Vehicle, "year" | "make" | "model" | "trim">,
): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}

/**
 * A readable, unique slug.
 *
 * `taken` is the set of slugs already in the table. Collisions get a numeric
 * suffix rather than a random one, so `/inventory/2019-ford-explorer-xlt-2`
 * still tells a person what they are looking at.
 */
export function buildVehicleSlug(
  parts: { year: number; make: string; model: string; trim?: string | null },
  taken: ReadonlySet<string>,
): string {
  const base =
    slugify([parts.year, parts.make, parts.model, parts.trim].filter(Boolean).join(" ")) ||
    "vehicle";

  if (!taken.has(base)) return base;

  for (let n = 2; n < 500; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Columns a partner feed is allowed to write — kept in step with
 * public.syncable_vehicle_columns(). Used to label which fields the admin
 * can lock against an incoming sync.
 */
export const SYNCABLE_COLUMNS: readonly string[] = [
  "vin",
  "stock_number",
  "year",
  "make",
  "model",
  "trim",
  "body_type",
  "mileage",
  "exterior_color",
  "interior_color",
  "transmission",
  "drivetrain",
  "fuel_type",
  "engine",
  "price",
  "monthly_payment",
  "down_payment",
  "description",
  "features",
  "status",
];

export const COLUMN_LABELS: Record<string, string> = {
  vin: "VIN",
  stock_number: "Stock number",
  year: "Year",
  make: "Make",
  model: "Model",
  trim: "Trim",
  body_type: "Body type",
  mileage: "Mileage",
  exterior_color: "Exterior colour",
  interior_color: "Interior colour",
  transmission: "Transmission",
  drivetrain: "Drivetrain",
  fuel_type: "Fuel type",
  engine: "Engine",
  price: "Price",
  monthly_payment: "Monthly payment",
  down_payment: "Down payment",
  description: "Description",
  features: "Features",
  status: "Status",
};

export function columnLabel(column: string): string {
  return COLUMN_LABELS[column] ?? column;
}
