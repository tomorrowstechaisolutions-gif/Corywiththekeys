import Link from "next/link";

import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";
import { LOT_TIMEZONE, type Appointment } from "@/lib/dashboard";
import type { Database } from "@/types/database";

const TYPE_LABELS: Record<
  Database["public"]["Enums"]["appointment_type"],
  string
> = {
  test_drive: "Test drive",
  delivery: "Delivery",
  consultation: "Consultation",
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["appointment_status"],
  string
> = {
  scheduled: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-800",
};

const time = new Intl.DateTimeFormat("en-US", {
  timeZone: LOT_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  timeZone: LOT_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Today's diary, straight from the appointments table. */
export function TodayPanel({
  appointments,
  now,
}: {
  appointments: readonly Appointment[];
  now: Date;
}) {
  return (
    <DashboardCard title="Today" subtitle={longDate.format(now)}>
      {appointments.length === 0 ? (
        <EmptyState
          title="Nothing booked today"
          detail="Test drives, deliveries and consultations show up here as soon as they are put in the diary."
          action={{ label: "Open appointments", href: "/admin/appointments" }}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="flex items-start gap-3 py-2.5 first:pt-0">
              <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-navy-900">
                {time.format(new Date(appointment.starts_at))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-navy-900">
                  {TYPE_LABELS[appointment.type]}
                </span>
                {appointment.location ? (
                  <span className="block truncate text-xs text-slate-500">
                    {appointment.location}
                  </span>
                ) : null}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[appointment.status]}`}
              >
                {appointment.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link
          href="/admin/calendar"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-slate-50"
        >
          Full calendar
        </Link>
        <Link
          href="/admin/tasks"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-slate-50"
        >
          All tasks
        </Link>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Tasks are not stored yet, so nothing is listed above them.
      </p>
    </DashboardCard>
  );
}
