import type { Metadata } from "next";

import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { AiDailyBrief } from "@/components/admin/dashboard/AiDailyBrief";
import { DateRangePicker } from "@/components/admin/dashboard/DateRangePicker";
import { InventoryPerformance } from "@/components/admin/dashboard/InventoryPerformance";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { PipelineSummary } from "@/components/admin/dashboard/PipelineSummary";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RecentLeads } from "@/components/admin/dashboard/RecentLeads";
import { SocialPerformance } from "@/components/admin/dashboard/SocialPerformance";
import { TodayPanel } from "@/components/admin/dashboard/TodayPanel";
import { Container } from "@/components/ui/Container";
import { ROLE_LABELS, displayName, requireSection } from "@/lib/auth";
import { VEHICLE_PHOTO_BUCKET } from "@/lib/buckets";
import { isRangeKey, loadDashboard, resolveRange } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { vehicleTitle } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Dashboard" };

/** Every figure here is "as of now". Never serve it from a cache. */
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; range?: string }>;
}) {
  const profile = await requireSection("dashboard");
  const { error, range: rangeParam } = await searchParams;

  const now = new Date();
  const range = resolveRange(isRangeKey(rangeParam) ? rangeParam : "month", now);

  const supabase = await createClient();
  const data = await loadDashboard(supabase, range, now);

  // Recent leads carry a vehicle id, not a name. One extra query rather than
  // a join, so the leads query stays the same shape the rest of the app uses.
  const vehicleIds = [
    ...new Set(data.recentLeads.map((l) => l.vehicle_id).filter(Boolean)),
  ] as string[];

  const { data: leadVehicles } = vehicleIds.length
    ? await supabase
        .from("vehicles")
        .select("id, year, make, model, trim")
        .in("id", vehicleIds)
    : { data: [] };

  const vehicleTitles = new Map(
    (leadVehicles ?? []).map((v) => [v.id, vehicleTitle(v)]),
  );

  const photoBase = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${VEHICLE_PHOTO_BUCKET}`
    : null;

  return (
    <Container className="py-6 lg:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyblue-600">
            Welcome back, {displayName(profile)}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Operations Command Center
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Run your dealership. Track performance. Close more deals. Grow
            smarter with AI.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <DateRangePicker value={range.key} spanLabel={range.spanLabel} />
          <QuickActions />
        </div>
      </div>

      {error === "forbidden" ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
        >
          That page is restricted to admins. You are signed in as{" "}
          {ROLE_LABELS[profile.role]}.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <PipelineSummary pipeline={data.pipeline} />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <AiDailyBrief items={data.brief} />
        </div>
        <div className="min-w-0 lg:col-span-3">
          <TodayPanel appointments={data.todayAppointments} now={now} />
        </div>
      </div>

      {/*
        The two tables get two thirds each. A table in a quarter-width column
        scrolls sideways on a 27-inch monitor, which nobody expects.
      */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <RecentLeads
            leads={data.recentLeads}
            vehicleTitles={vehicleTitles}
            now={now}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <ActivityFeed items={data.activity} now={now} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <InventoryPerformance
            vehicles={data.inventory}
            photoBase={photoBase}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <SocialPerformance />
        </div>
      </div>
    </Container>
  );
}
