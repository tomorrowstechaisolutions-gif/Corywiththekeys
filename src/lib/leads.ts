import type { Database } from "@/types/database";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type LeadSource = Database["public"]["Enums"]["lead_source"];
export type LeadEvent = Database["public"]["Tables"]["lead_events"]["Row"];

/**
 * The stages a lead moves through, in order.
 *
 * Deliberately short. A long pipeline looks impressive and gets ignored:
 * staff pick whichever stage is nearest and the data stops meaning anything.
 * Five live stages and two endings is what a small lot actually uses.
 */
export const LEAD_STATUSES: readonly LeadStatus[] = [
  "new",
  "contacted",
  "working",
  "appointment_set",
  "prequalified",
  "won",
  "lost",
];

/** Stages where the lead is still in play. */
export const OPEN_STATUSES: readonly LeadStatus[] = [
  "new",
  "contacted",
  "working",
  "appointment_set",
  "prequalified",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  working: "Working",
  appointment_set: "Appointment set",
  prequalified: "Prequalified",
  won: "Sold",
  lost: "Lost",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-keyblue-600 text-white",
  contacted: "bg-keyblue-600/10 text-keyblue-700",
  working: "bg-amber-100 text-amber-900",
  appointment_set: "bg-gold-600 text-white",
  prequalified: "bg-violet-100 text-violet-900",
  won: "bg-emerald-600 text-white",
  lost: "bg-slate-200 text-slate-700",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  homepage_form: "Homepage form",
  vehicle_inquiry: "Vehicle enquiry",
  financing: "Financing",
  prequalification: "Prequalification",
  trade_in: "Trade-in",
  contact_form: "Contact form",
  find_my_car: "Find my car",
  phone: "Phone call",
  walk_in: "Walk-in",
  referral: "Referral",
  social: "Social",
  other: "Other",
};

/**
 * Sources a person can pick when typing a lead in by hand.
 *
 * The website sources are excluded deliberately: "Contact form" means the
 * contact form actually created it. Letting somebody choose that by hand
 * would quietly ruin the only figure that tells Cory whether his website is
 * working.
 */
export const MANUAL_LEAD_SOURCES: readonly LeadSource[] = [
  "phone",
  "walk_in",
  "referral",
  "social",
  "other",
];

export function leadName(lead: Pick<Lead, "first_name" | "last_name" | "email" | "phone">): string {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim();
  return name || lead.email || lead.phone || "Unnamed enquiry";
}

export function isOpen(status: LeadStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

/**
 * How overdue a follow-up is, in whole days. Negative means it is still ahead.
 *
 * Compared as calendar dates rather than instants, because "due today" should
 * stay "due today" all day rather than becoming overdue at one minute past
 * midnight in whichever timezone the server happens to be in.
 */
export function daysOverdue(date: string | null, today = new Date()): number | null {
  if (!date) return null;

  const [year, month, day] = date.split("-").map(Number);
  const due = Date.UTC(year, month - 1, day);
  const now = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  return Math.round((now - due) / 86_400_000);
}

/** "3 days ago", "just now" — for a timeline nobody wants to read timestamps in. */
export function timeAgo(iso: string, now = new Date()): string {
  const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86_400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }

  const d = Math.floor(seconds / 86_400);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;

  const months = Math.floor(d / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/**
 * How urgently this lead needs attention, for sorting.
 *
 * Lower sorts first. The order it produces is the order a salesperson would
 * work the list in if they were thinking clearly: overdue promises first,
 * then anything nobody has ever replied to, then everything else by neglect.
 * Closed leads sink.
 */
export function attentionRank(lead: Lead, today = new Date()): number {
  if (!isOpen(lead.status)) return 400;

  const overdue = daysOverdue(lead.next_follow_up_at, today);

  if (overdue !== null && overdue > 0) return 0;
  if (overdue === 0) return 100;
  if (lead.status === "new" && !lead.contacted_at) return 200;
  if (overdue !== null) return 350;
  return 300;
}

export type Attention =
  | { kind: "overdue"; days: number; label: string }
  | { kind: "due-today"; label: string }
  | { kind: "never-contacted"; label: string }
  | { kind: "scheduled"; label: string }
  | { kind: "none" };

/** The one-line reason this lead is where it is in the list. */
export function attention(lead: Lead, today = new Date()): Attention {
  if (!isOpen(lead.status)) return { kind: "none" };

  const overdue = daysOverdue(lead.next_follow_up_at, today);

  if (overdue !== null && overdue > 0) {
    return {
      kind: "overdue",
      days: overdue,
      label: `Follow-up ${overdue} day${overdue === 1 ? "" : "s"} overdue`,
    };
  }
  if (overdue === 0) return { kind: "due-today", label: "Follow up today" };
  if (lead.status === "new" && !lead.contacted_at) {
    return { kind: "never-contacted", label: "Nobody has replied yet" };
  }
  if (overdue !== null) {
    return {
      kind: "scheduled",
      label: `Follow up in ${Math.abs(overdue)} day${overdue === -1 ? "" : "s"}`,
    };
  }
  return { kind: "none" };
}

export const ATTENTION_STYLES: Record<Attention["kind"], string> = {
  overdue: "bg-red-100 text-red-800",
  "due-today": "bg-amber-100 text-amber-900",
  "never-contacted": "bg-keyblue-600/10 text-keyblue-700",
  scheduled: "bg-slate-100 text-slate-700",
  none: "",
};

/** Today, as the YYYY-MM-DD a date input expects. */
export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDaysISO(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
