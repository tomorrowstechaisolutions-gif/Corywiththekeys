import { DashboardCard, EmptyState } from "@/components/admin/dashboard/DashboardCard";

const PLATFORMS = ["Facebook", "Instagram", "TikTok"] as const;

/**
 * Reach and engagement across the social accounts.
 *
 * Nothing is connected: there is no social integration, no stored posts and
 * no metrics table. Rather than invent a reach figure, the card says what is
 * missing and points at the screen where it will be connected.
 */
export function SocialPerformance() {
  return (
    <DashboardCard
      title="Social performance"
      subtitle="Facebook · Instagram · TikTok"
      action={{ label: "Social Center", href: "/admin/social" }}
    >
      <ul className="mb-4 grid grid-cols-3 gap-2">
        {PLATFORMS.map((platform) => (
          <li
            key={platform}
            className="rounded-lg border border-slate-200 px-3 py-2.5"
          >
            <p className="truncate text-[11px] font-medium text-slate-500">
              {platform}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-300">—</p>
          </li>
        ))}
      </ul>

      <EmptyState
        title="No accounts connected"
        detail="Reach, engagement and video views appear once Facebook, Instagram and TikTok are connected. Nothing is estimated here."
        action={{ label: "Connect accounts", href: "/admin/integrations" }}
      />
    </DashboardCard>
  );
}
