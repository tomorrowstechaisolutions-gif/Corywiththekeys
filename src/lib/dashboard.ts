import "server-only";

import {
  RANGE_LABELS,
  type RangeKey,
} from "@/lib/dashboard-ranges";
import { isOpen, type Lead } from "@/lib/leads";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type DealStage = Database["public"]["Enums"]["deal_stage"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AuditRow = Database["public"]["Tables"]["audit_log"]["Row"];

/**
 * The lot is in Killeen, Texas, and "today" means today there.
 *
 * Vercel runs in UTC, so without this a 7pm appointment would move to
 * tomorrow's list at 7pm Central. Every boundary on this screen — today,
 * this month, the previous period — is worked out in this zone.
 */
export const LOT_TIMEZONE = "America/Chicago";

// Re-exported so a server component needs one import, not two. The client
// picker must import them from "@/lib/dashboard-ranges" directly.
export {
  RANGE_KEYS,
  RANGE_LABELS,
  isRangeKey,
  type RangeKey,
} from "@/lib/dashboard-ranges";

/* ── date helpers ──────────────────────────────────────────────────────── */

function zoneOffsetMs(at: Date, timeZone: string): number {
  const utc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(at.toLocaleString("en-US", { timeZone }));
  return local.getTime() - utc.getTime();
}

/** The instant at which the given local calendar day begins. */
function startOfLocalDay(
  year: number,
  month: number,
  day: number,
  timeZone = LOT_TIMEZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day);
  return new Date(guess - zoneOffsetMs(new Date(guess), timeZone));
}

/** Today's calendar date in the lot's timezone. */
export function localToday(now = new Date(), timeZone = LOT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return { year: get("year"), month: get("month"), day: get("day") };
}


export type DateRange = {
  key: RangeKey;
  label: string;
  /** Human-readable span, e.g. "1 – 30 Sep". */
  spanLabel: string;
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  /** Whole days covered, used to size the sparkline. */
  days: number;
};

/**
 * The window the whole screen is read through.
 *
 * The previous window is always the same length and sits immediately before,
 * so "up 23%" compares like with like rather than a full month against a
 * part-month.
 */
export function resolveRange(key: RangeKey, now = new Date()): DateRange {
  const today = localToday(now);
  const tomorrow = startOfLocalDay(today.year, today.month, today.day + 1);

  let from: Date;

  if (key === "month") {
    from = startOfLocalDay(today.year, today.month, 1);
  } else {
    const span = key === "7d" ? 7 : key === "30d" ? 30 : 90;
    from = startOfLocalDay(today.year, today.month, today.day - (span - 1));
  }

  const to = tomorrow;
  const length = to.getTime() - from.getTime();

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: LOT_TIMEZONE,
    day: "numeric",
    month: "short",
  });

  return {
    key,
    label: RANGE_LABELS[key],
    spanLabel: `${fmt.format(from)} – ${fmt.format(new Date(to.getTime() - 1))}`,
    from,
    to,
    previousFrom: new Date(from.getTime() - length),
    previousTo: from,
    days: Math.max(1, Math.round(length / 86_400_000)),
  };
}

/* ── shapes ────────────────────────────────────────────────────────────── */

export type Delta =
  | { kind: "percent"; value: number; label: string }
  | { kind: "note"; label: string }
  | { kind: "none" };

export type Kpi = {
  key: string;
  label: string;
  /** Null means the figure cannot be worked out from what is stored yet. */
  value: number | null;
  display: string;
  delta: Delta;
  /** Daily counts across the range. Empty when the metric has no history. */
  series: readonly number[];
  href: string;
  unavailable?: string;
};

export type PipelineStage = {
  key: string;
  label: string;
  count: number;
  stages: readonly DealStage[];
};

export type BriefItem = {
  key: string;
  label: string;
  detail: string;
  count: number;
  href: string;
  tone: "urgent" | "warn" | "info";
};

export type InventoryRow = {
  id: string;
  title: string;
  price: number | null;
  stockNumber: string | null;
  mileage: number | null;
  daysOnLot: number | null;
  inquiries: number;
  photoPath: string | null;
};

export type ActivityItem = {
  id: number;
  label: string;
  detail: string;
  actor: string;
  at: string;
  href: string | null;
};

export type DashboardData = {
  range: DateRange;
  kpis: readonly Kpi[];
  pipeline: {
    stages: readonly PipelineStage[];
    total: number;
    value: number | null;
    conversion: number | null;
    conversionBasis: number;
  };
  brief: readonly BriefItem[];
  todayAppointments: readonly Appointment[];
  recentLeads: readonly Lead[];
  inventory: readonly InventoryRow[];
  activity: readonly ActivityItem[];
};

/* ── the query ─────────────────────────────────────────────────────────── */

const OPEN_DEAL_STAGES: readonly DealStage[] = [
  "new",
  "qualified",
  "prequalified",
  "vehicle_selected",
  "lender_submitted",
  "approved",
  "paperwork",
];

/**
 * The six columns on the pipeline card, mapped onto the nine stages the
 * database actually stores.
 *
 * The stage names are not renamed and no stored value is rewritten — the
 * three stages between "approved" and delivery are one column because that is
 * one thing a person waits on, not because the data was reshaped to fit a
 * picture.
 */
const PIPELINE_COLUMNS: readonly { key: string; label: string; stages: readonly DealStage[] }[] = [
  { key: "new", label: "New", stages: ["new"] },
  { key: "qualified", label: "Qualified", stages: ["qualified"] },
  { key: "prequalified", label: "Prequalified", stages: ["prequalified"] },
  { key: "selected", label: "Vehicle picked", stages: ["vehicle_selected"] },
  {
    key: "approved",
    label: "Approved",
    stages: ["lender_submitted", "approved", "paperwork"],
  },
  { key: "delivered", label: "Delivered", stages: ["delivered"] },
];

/** How many days on the lot counts as aging, for the brief. */
const AGING_DAYS = 45;

function percentDelta(current: number, previous: number, unit: string): Delta {
  if (previous === 0 && current === 0) return { kind: "none" };
  if (previous === 0) {
    return { kind: "note", label: `first ${unit} in this period` };
  }
  return {
    kind: "percent",
    value: Math.round(((current - previous) / previous) * 100),
    label: "vs previous period",
  };
}

/** Daily buckets across the range, in the lot's timezone. */
function daily(dates: readonly string[], range: DateRange): number[] {
  const buckets = new Array<number>(Math.min(range.days, 90)).fill(0);
  const size = 86_400_000;

  for (const iso of dates) {
    const index = Math.floor(
      (new Date(iso).getTime() - range.from.getTime()) / size,
    );
    if (index >= 0 && index < buckets.length) buckets[index] += 1;
  }

  return buckets;
}

function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000),
  );
}

/**
 * Everything the Operations Command Center shows, in one pass.
 *
 * Read with the signed-in user's session, so RLS decides what comes back —
 * a viewer sees exactly what a viewer is allowed to see, and none of these
 * figures can leak past a role gate.
 */
export async function loadDashboard(
  supabase: Client,
  range: DateRange,
  now = new Date(),
): Promise<DashboardData> {
  const today = localToday(now);
  const todayStart = startOfLocalDay(today.year, today.month, today.day);
  const todayEnd = startOfLocalDay(today.year, today.month, today.day + 1);
  const yesterdayStart = startOfLocalDay(today.year, today.month, today.day - 1);
  const weekAhead = startOfLocalDay(today.year, today.month, today.day + 7);
  const agingBefore = startOfLocalDay(
    today.year,
    today.month,
    today.day - AGING_DAYS,
  );

  const iso = (d: Date) => d.toISOString();

  const [
    leadsInRange,
    leadsPrevious,
    activeVehicles,
    vehiclesAddedInRange,
    dealsRows,
    appointmentsToday,
    appointmentsYesterday,
    appointmentsToConfirm,
    agingVehicles,
    openLeads,
    recentLeadsRows,
    inventoryRows,
    vehicleInquiries,
    auditRows,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("created_at")
      .gte("created_at", iso(range.from))
      .lt("created_at", iso(range.to)),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", iso(range.previousFrom))
      .lt("created_at", iso(range.previousTo)),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", iso(range.from))
      .lt("created_at", iso(range.to)),
    supabase
      .from("deals")
      .select("id, stage, sale_price, created_at, closed_at")
      .limit(1000),
    supabase
      .from("appointments")
      .select("*")
      .gte("starts_at", iso(todayStart))
      .lt("starts_at", iso(todayEnd))
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", iso(yesterdayStart))
      .lt("starts_at", iso(todayStart))
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("starts_at", iso(todayStart))
      .lt("starts_at", iso(weekAhead)),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("status", "available")
      .lt("created_at", iso(agingBefore)),
    supabase
      .from("leads")
      .select("id, status, contacted_at, next_follow_up_at")
      .limit(1000),
    supabase
      .from("leads")
      .select("*")
      .order("last_activity_at", { ascending: false })
      .limit(6),
    supabase
      .from("vehicles")
      .select(
        "id, year, make, model, trim, price, mileage, stock_number, created_at, is_featured, vehicle_photos ( storage_path, is_primary, position )",
      )
      .eq("status", "available")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(5),
    supabase.from("leads").select("vehicle_id").not("vehicle_id", "is", null).limit(2000),
    supabase
      .from("audit_log")
      .select("id, table_name, action, record_id, actor_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  /* ── KPIs ───────────────────────────────────────────────────────────── */

  const leadDates = (leadsInRange.data ?? []).map((r) => r.created_at);
  const newLeads = leadDates.length;
  const previousLeads = leadsPrevious.count ?? 0;

  const deals = dealsRows.data ?? [];
  const dealsOpen = deals.filter((d) =>
    OPEN_DEAL_STAGES.includes(d.stage),
  );
  const dealsOpenedInRange = deals.filter(
    (d) =>
      d.created_at >= iso(range.from) && d.created_at < iso(range.to),
  );
  const deliveredInRange = deals.filter(
    (d) =>
      d.stage === "delivered" &&
      d.closed_at !== null &&
      d.closed_at >= iso(range.from) &&
      d.closed_at < iso(range.to),
  );
  const deliveredPrevious = deals.filter(
    (d) =>
      d.stage === "delivered" &&
      d.closed_at !== null &&
      d.closed_at >= iso(range.previousFrom) &&
      d.closed_at < iso(range.previousTo),
  );

  const revenue = deliveredInRange.reduce(
    (sum, d) => sum + (d.sale_price ?? 0),
    0,
  );
  const revenuePrevious = deliveredPrevious.reduce(
    (sum, d) => sum + (d.sale_price ?? 0),
    0,
  );

  const appointmentsTodayCount = (appointmentsToday.data ?? []).length;
  const appointmentsYesterdayCount = appointmentsYesterday.count ?? 0;

  const currency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const kpis: Kpi[] = [
    {
      key: "leads",
      label: "New leads",
      value: newLeads,
      display: String(newLeads),
      delta: percentDelta(newLeads, previousLeads, "lead"),
      series: daily(leadDates, range),
      href: "/admin/leads",
    },
    {
      key: "inventory",
      label: "Active inventory",
      value: activeVehicles.count ?? 0,
      display: String(activeVehicles.count ?? 0),
      // Not a percentage: there is no history of what the lot held last month,
      // so the only true comparison is what came in during this period.
      delta: {
        kind: "note",
        label: `${vehiclesAddedInRange.count ?? 0} added this period`,
      },
      series: [],
      href: "/admin/inventory",
    },
    {
      key: "deals",
      label: "Deals in progress",
      value: dealsOpen.length,
      display: String(dealsOpen.length),
      delta: {
        kind: "note",
        label: `${dealsOpenedInRange.length} opened this period`,
      },
      series: [],
      href: "/admin/pipeline",
    },
    {
      key: "appointments",
      label: "Appointments today",
      value: appointmentsTodayCount,
      display: String(appointmentsTodayCount),
      delta: percentDelta(
        appointmentsTodayCount,
        appointmentsYesterdayCount,
        "appointment",
      ),
      series: [],
      href: "/admin/appointments",
    },
    {
      key: "revenue",
      label: "Revenue this period",
      value: revenue,
      display: deliveredInRange.length === 0 ? "—" : currency(revenue),
      delta:
        deliveredInRange.length === 0
          ? { kind: "note", label: "no deals delivered yet" }
          : percentDelta(revenue, revenuePrevious, "sale"),
      series: [],
      href: "/admin/deals",
      unavailable:
        deliveredInRange.length === 0
          ? "Counts a deal once its stage is Delivered and a sale price is on it."
          : undefined,
    },
  ];

  /* ── pipeline ───────────────────────────────────────────────────────── */

  const stageCount = (stages: readonly DealStage[]) =>
    stages.includes("delivered")
      ? deliveredInRange.length
      : deals.filter((d) => stages.includes(d.stage)).length;

  const pipelineStages = PIPELINE_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    stages: column.stages,
    count: stageCount(column.stages),
  }));

  const pipelineValue = dealsOpen.reduce(
    (sum, d) => sum + (d.sale_price ?? 0),
    0,
  );
  const priced = dealsOpen.filter((d) => d.sale_price !== null).length;

  const settledInRange = dealsOpenedInRange.filter(
    (d) => d.stage === "delivered" || d.stage === "lost",
  );
  const wonInRange = settledInRange.filter((d) => d.stage === "delivered");

  /* ── AI daily brief ─────────────────────────────────────────────────── */

  const leadsForBrief = (openLeads.data ?? []) as Pick<
    Lead,
    "id" | "status" | "contacted_at" | "next_follow_up_at"
  >[];

  const todayIsoDate = `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;

  const overdue = leadsForBrief.filter(
    (l) =>
      isOpen(l.status) &&
      l.next_follow_up_at !== null &&
      l.next_follow_up_at < todayIsoDate,
  ).length;

  const neverContacted = leadsForBrief.filter(
    (l) => isOpen(l.status) && l.contacted_at === null,
  ).length;

  const aging = agingVehicles.count ?? 0;
  const toConfirm = appointmentsToConfirm.count ?? 0;

  const brief: BriefItem[] = [];

  if (overdue > 0) {
    brief.push({
      key: "overdue",
      label: `Follow up on ${overdue} overdue lead${overdue === 1 ? "" : "s"}`,
      detail: "The follow-up date on these has already passed.",
      count: overdue,
      href: "/admin/leads?view=attention",
      tone: "urgent",
    });
  }

  if (neverContacted > 0) {
    brief.push({
      key: "untouched",
      label: `${neverContacted} lead${neverContacted === 1 ? " has" : "s have"} had no reply`,
      detail: "Nobody has logged contact with them yet.",
      count: neverContacted,
      href: "/admin/leads?view=attention",
      tone: "urgent",
    });
  }

  if (aging > 0) {
    brief.push({
      key: "aging",
      label: `${aging} vehicle${aging === 1 ? "" : "s"} on the lot over ${AGING_DAYS} days`,
      detail: "Worth a price review or a fresh set of photos.",
      count: aging,
      href: "/admin/inventory",
      tone: "warn",
    });
  }

  if (toConfirm > 0) {
    brief.push({
      key: "confirm",
      label: `${toConfirm} appointment${toConfirm === 1 ? "" : "s"} still unconfirmed`,
      detail: "Booked in the next seven days and not confirmed yet.",
      count: toConfirm,
      href: "/admin/appointments",
      tone: "info",
    });
  }

  /* ── inventory performance ──────────────────────────────────────────── */

  const inquiryCounts = new Map<string, number>();
  for (const row of vehicleInquiries.data ?? []) {
    if (!row.vehicle_id) continue;
    inquiryCounts.set(row.vehicle_id, (inquiryCounts.get(row.vehicle_id) ?? 0) + 1);
  }

  type InventoryQueryRow = {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    price: number | null;
    mileage: number | null;
    stock_number: string | null;
    created_at: string;
    vehicle_photos: { storage_path: string | null; is_primary: boolean; position: number }[] | null;
  };

  const inventory: InventoryRow[] = ((inventoryRows.data ?? []) as unknown as InventoryQueryRow[]).map(
    (v) => {
      const photo = [...(v.vehicle_photos ?? [])]
        .filter((p) => p.storage_path)
        .sort(
          (a, b) =>
            Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
        )[0];

      return {
        id: v.id,
        title: [v.year, v.make, v.model, v.trim].filter(Boolean).join(" "),
        price: v.price,
        stockNumber: v.stock_number,
        mileage: v.mileage,
        daysOnLot: daysSince(v.created_at, now),
        inquiries: inquiryCounts.get(v.id) ?? 0,
        photoPath: photo?.storage_path ?? null,
      };
    },
  );

  /* ── activity feed ──────────────────────────────────────────────────── */

  const audit = (auditRows.data ?? []) as Pick<
    AuditRow,
    "id" | "table_name" | "action" | "record_id" | "actor_id" | "created_at"
  >[];

  const actorIds = [...new Set(audit.map((a) => a.actor_id).filter(Boolean))] as string[];

  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", actorIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const actorNames = new Map(
    (actors ?? []).map((a) => [a.id, a.full_name?.trim() || a.email]),
  );

  const TABLE_LABELS: Record<string, string> = {
    leads: "Lead",
    vehicles: "Vehicle",
    deals: "Deal",
    appointments: "Appointment",
    customers: "Customer",
    products: "Product",
    partner_lots: "Partner lot",
    prequalifications: "Prequalification",
    trade_ins: "Trade-in",
    profiles: "Team member",
    site_settings: "Settings",
    messages: "Message",
  };

  const ACTION_LABELS: Record<string, string> = {
    insert: "added",
    update: "updated",
    delete: "removed",
  };

  const RECORD_HREFS: Record<string, string> = {
    leads: "/admin/leads",
    vehicles: "/admin/inventory",
    products: "/admin/shop",
    partner_lots: "/admin/partner-lots",
  };

  const activity: ActivityItem[] = audit.map((row) => ({
    id: row.id,
    label: `${TABLE_LABELS[row.table_name] ?? row.table_name} ${ACTION_LABELS[row.action] ?? row.action}`,
    detail: TABLE_LABELS[row.table_name] ?? row.table_name,
    actor: row.actor_id ? (actorNames.get(row.actor_id) ?? "A team member") : "The website",
    at: row.created_at,
    href:
      row.record_id && RECORD_HREFS[row.table_name]
        ? `${RECORD_HREFS[row.table_name]}/${row.record_id}`
        : (RECORD_HREFS[row.table_name] ?? null),
  }));

  return {
    range,
    kpis,
    pipeline: {
      stages: pipelineStages,
      total: dealsOpen.length,
      value: priced === 0 ? null : pipelineValue,
      conversion:
        settledInRange.length === 0
          ? null
          : Math.round((wonInRange.length / settledInRange.length) * 100),
      conversionBasis: settledInRange.length,
    },
    brief,
    todayAppointments: (appointmentsToday.data ?? []) as Appointment[],
    recentLeads: (recentLeadsRows.data ?? []) as Lead[],
    inventory,
    activity,
  };
}
