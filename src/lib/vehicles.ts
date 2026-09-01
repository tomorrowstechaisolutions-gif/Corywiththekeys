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

/**
 * Assumptions behind every "Est. $X/mo" figure on the site.
 *
 * These are ESTIMATES for shopping, not offers. They are stated in one place
 * so the disclaimer, the payment filter and the card all agree, and so the
 * numbers can be corrected in a single edit when Cory's real lender terms
 * are known.
 */
export const FINANCE_ASSUMPTIONS = {
  termMonths: 72,
  annualRate: 0.129,
  downPaymentRate: 0.1,
} as const;

export const PAYMENT_DISCLAIMER =
  "*Estimated payments with approved credit. Tax, title, fees, down payment, interest rate, and loan terms may affect actual payment. Not a guarantee of approval or terms.";

/** Standard amortised payment. Returns null when there is no price to work from. */
export function estimateMonthlyPayment(price: number | null): number | null {
  if (!price || price <= 0) return null;

  const { termMonths, annualRate, downPaymentRate } = FINANCE_ASSUMPTIONS;
  const financed = price * (1 - downPaymentRate);
  const monthlyRate = annualRate / 12;

  const payment =
    (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  return Math.round(payment);
}

/**
 * The inverse: the highest sticker price that lands under a given monthly
 * payment. Used so the "Monthly Payment" filter can still include vehicles
 * that have no stored payment figure.
 */
export function priceForPayment(payment: number): number {
  const { termMonths, annualRate, downPaymentRate } = FINANCE_ASSUMPTIONS;
  const monthlyRate = annualRate / 12;

  const financed =
    (payment * (1 - Math.pow(1 + monthlyRate, -termMonths))) / monthlyRate;

  return Math.round(financed / (1 - downPaymentRate));
}

/** The payment to show: the one staff entered, else the estimate. */
export function displayPayment(vehicle: {
  price: number | null;
  monthly_payment: number | null;
}): number | null {
  return vehicle.monthly_payment
    ? Math.round(vehicle.monthly_payment)
    : estimateMonthlyPayment(vehicle.price);
}

export type VehicleBadge = {
  label: string;
  className: string;
};

const NEW_ARRIVAL_DAYS = 21;

/**
 * At most one badge per card. Order is deliberate: a hand-picked Featured
 * flag outranks an automatic one, and a price drop is the strongest reason
 * for a shopper to look twice.
 */
export function vehicleBadge(vehicle: {
  is_featured: boolean;
  previous_price: number | null;
  price: number | null;
  source: VehicleSource;
  created_at: string;
}): VehicleBadge | null {
  if (vehicle.is_featured) {
    return { label: "Featured", className: "bg-keyblue-600 text-white" };
  }

  if (
    vehicle.previous_price !== null &&
    vehicle.price !== null &&
    vehicle.previous_price > vehicle.price
  ) {
    return { label: "Price Drop", className: "bg-emerald-600 text-white" };
  }

  const ageMs = Date.now() - new Date(vehicle.created_at).getTime();
  if (ageMs < NEW_ARRIVAL_DAYS * 86_400_000) {
    return { label: "New Arrival", className: "bg-keyblue-500 text-white" };
  }

  if (vehicle.source === "partner") {
    return { label: "Partner Lot", className: "bg-violet-600 text-white" };
  }

  return null;
}
