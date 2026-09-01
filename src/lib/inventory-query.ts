import type { SupabaseClient } from "@supabase/supabase-js";

import { priceForPayment } from "@/lib/vehicles";
import type { Database } from "@/types/database";

export const PAGE_SIZE = 12;

/** Where the financing banner is injected into the grid. */
export const BANNER_AFTER = 4;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "mileage-asc", label: "Mileage: Low to High" },
  { value: "year-desc", label: "Year: Newest" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type InventoryFilters = {
  q: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  maxPrice: number | null;
  maxPayment: number | null;
  maxMileage: number | null;
  bodyStyle: string | null;
  source: "owned" | "partner" | null;
  sort: SortValue;
  view: "grid" | "list";
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

function num(value: string | string[] | undefined): number | null {
  const raw = one(value);
  if (!raw) return null;
  const parsed = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Read filters from the URL.
 *
 * Every filter lives in a search param so a shopper can bookmark or share
 * "SUVs under $30k" and Cory can paste a filtered link into a text message.
 */
export function parseInventoryParams(
  params: RawSearchParams,
): InventoryFilters {
  const sort = one(params.sort);
  const view = one(params.view);
  const source = one(params.source);
  const page = num(params.page);

  return {
    q: one(params.q),
    make: one(params.make),
    model: one(params.model),
    year: num(params.year),
    maxPrice: num(params.maxPrice),
    maxPayment: num(params.maxPayment),
    maxMileage: num(params.maxMileage),
    bodyStyle: one(params.bodyStyle),
    source: source === "owned" || source === "partner" ? source : null,
    sort: SORT_OPTIONS.some((o) => o.value === sort)
      ? (sort as SortValue)
      : "featured",
    view: view === "list" ? "list" : "grid",
    page: page && page >= 1 ? Math.floor(page) : 1,
  };
}

/** True when anything narrows the list, so the UI can offer "Clear filters". */
export function hasActiveFilters(filters: InventoryFilters): boolean {
  return Boolean(
    filters.q ||
      filters.make ||
      filters.model ||
      filters.year ||
      filters.maxPrice ||
      filters.maxPayment ||
      filters.maxMileage ||
      filters.bodyStyle ||
      filters.source,
  );
}

/** Rebuild the query string, dropping empties and resetting the page. */
export function buildInventoryHref(
  filters: Partial<InventoryFilters>,
  overrides: Partial<InventoryFilters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const search = new URLSearchParams();

  const put = (key: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return;
    search.set(key, String(value));
  };

  put("q", merged.q);
  put("make", merged.make);
  put("model", merged.model);
  put("year", merged.year);
  put("maxPrice", merged.maxPrice);
  put("maxPayment", merged.maxPayment);
  put("maxMileage", merged.maxMileage);
  put("bodyStyle", merged.bodyStyle);
  put("source", merged.source);
  if (merged.sort && merged.sort !== "featured") put("sort", merged.sort);
  if (merged.view === "list") put("view", "list");
  if (merged.page && merged.page > 1) put("page", merged.page);

  const qs = search.toString();
  return qs ? `/inventory?${qs}` : "/inventory";
}

type Client = SupabaseClient<Database>;

export const VEHICLE_CARD_COLUMNS = `
  id, slug, year, make, model, trim, mileage, transmission, drivetrain,
  body_type, price, monthly_payment, previous_price, status, is_featured,
  source, created_at,
  partner_lots ( name, display_on_site ),
  vehicle_photos ( storage_path, remote_url, alt_text, is_primary, position )
` as const;

/**
 * One paginated, server-filtered page of public inventory.
 *
 * Filtering and sorting happen in Postgres — the browser never receives rows
 * it will not display. `count: "exact"` gives the true total for the results
 * header and pagination without a second round trip.
 */
export async function queryInventory(supabase: Client, filters: InventoryFilters) {
  let query = supabase
    .from("vehicles")
    .select(VEHICLE_CARD_COLUMNS, { count: "exact" })
    .in("status", ["available", "pending"]);

  if (filters.q) {
    // Escape PostgREST's delimiters so a comma or paren cannot break out.
    const term = filters.q.replace(/[,()]/g, " ").trim();
    if (term) {
      query = query.or(
        [
          `make.ilike.%${term}%`,
          `model.ilike.%${term}%`,
          `trim.ilike.%${term}%`,
          `body_type.ilike.%${term}%`,
          `stock_number.ilike.%${term}%`,
          `description.ilike.%${term}%`,
        ].join(","),
      );
    }
  }

  if (filters.make) query = query.eq("make", filters.make);
  if (filters.model) query = query.eq("model", filters.model);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.bodyStyle) query = query.eq("body_type", filters.bodyStyle);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.maxMileage) query = query.lte("mileage", filters.maxMileage);

  if (filters.maxPayment) {
    // Most vehicles have no stored monthly payment, so filtering on that
    // column alone would hide almost everything. Use the stored figure when
    // it exists, otherwise the sticker price that produces the same payment
    // under FINANCE_ASSUMPTIONS.
    const equivalentPrice = priceForPayment(filters.maxPayment);
    query = query.or(
      `monthly_payment.lte.${filters.maxPayment},and(monthly_payment.is.null,price.lte.${equivalentPrice})`,
    );
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "mileage-asc":
      query = query.order("mileage", { ascending: true, nullsFirst: false });
      break;
    case "year-desc":
      query = query.order("year", { ascending: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  return {
    vehicles: data ?? [],
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    error,
  };
}

export type InventoryVehicle = Awaited<
  ReturnType<typeof queryInventory>
>["vehicles"][number];

export type FilterFacets = {
  makes: string[];
  models: Record<string, string[]>;
  years: number[];
  bodyStyles: string[];
};

/**
 * Build the dropdown options from what is actually on the lot.
 *
 * Offering "Lamborghini" on a filter that returns nothing is a worse
 * experience than a shorter list. Only five small columns are read, and only
 * for vehicles the public can already see.
 */
export async function getFilterFacets(supabase: Client): Promise<FilterFacets> {
  const { data } = await supabase
    .from("vehicles")
    .select("make, model, year, body_type")
    .in("status", ["available", "pending"])
    .limit(2000);

  const makes = new Set<string>();
  const models: Record<string, Set<string>> = {};
  const years = new Set<number>();
  const bodyStyles = new Set<string>();

  for (const row of data ?? []) {
    if (row.make) {
      makes.add(row.make);
      models[row.make] ??= new Set();
      if (row.model) models[row.make].add(row.model);
    }
    if (row.year) years.add(row.year);
    if (row.body_type) bodyStyles.add(row.body_type);
  }

  return {
    makes: [...makes].sort((a, b) => a.localeCompare(b)),
    models: Object.fromEntries(
      Object.entries(models).map(([make, set]) => [
        make,
        [...set].sort((a, b) => a.localeCompare(b)),
      ]),
    ),
    years: [...years].sort((a, b) => b - a),
    bodyStyles: [...bodyStyles].sort((a, b) => a.localeCompare(b)),
  };
}

export const PRICE_STEPS = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000];
export const PAYMENT_STEPS = [250, 350, 450, 550, 650, 800, 1000];
export const MILEAGE_STEPS = [20000, 40000, 60000, 80000, 100000, 150000];
