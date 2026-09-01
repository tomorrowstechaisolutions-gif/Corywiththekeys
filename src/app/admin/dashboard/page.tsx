import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { displayName, requireStaff, ROLE_LABELS } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireStaff();
  const { error } = await searchParams;

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title={`Welcome, ${displayName(profile)}`}
      description="At-a-glance KPIs across leads, prequalifications, inventory and appointments."
      scope={[
        "Lead and prequalification counters",
        "Pipeline value and conversion",
        "Today's appointments",
        "Recent activity feed from audit_log",
      ]}
    >
      {error === "forbidden" ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          That page is restricted to admins. You are signed in as{" "}
          {ROLE_LABELS[profile.role]}.
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs uppercase tracking-wider text-navy-700">
            Role
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy-900">
            {ROLE_LABELS[profile.role]}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs uppercase tracking-wider text-navy-700">
            Title
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy-900">
            {profile.title ?? "—"}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-xs uppercase tracking-wider text-navy-700">
            Email
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-navy-900">
            {profile.email}
          </dd>
        </div>
      </dl>
    </PagePlaceholder>
  );
}
