import Link from "next/link";

import { signOut } from "@/app/(auth)/login/actions";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { Avatar } from "@/components/admin/Avatar";
import { navFor } from "@/lib/admin-nav";
import { displayName, ROLE_LABELS, type Profile } from "@/lib/auth";
import { initials } from "@/lib/avatars";

/** Admin console top bar. Shows who is signed in and how to leave. */
export function AdminTopbar({
  profile,
  avatarUrl,
}: {
  profile: Profile;
  avatarUrl: string | null;
}) {
  const name = displayName(profile);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6">
      <AdminMobileNav items={navFor(profile)} />

      {/*
        The whole name block is the link to your own profile. Everyone has one,
        including someone restricted to a single section, so this sits here
        rather than in the sidebar where section rules live.
      */}
      <Link
        href="/admin/profile"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 transition hover:bg-slate-50"
      >
        <Avatar url={avatarUrl} initials={initials(name)} size={32} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-navy-900">
            {name}
          </span>
          <span className="block truncate text-xs text-navy-700">
            {profile.title ?? ROLE_LABELS[profile.role]}
            {profile.title ? (
              <span className="text-muted"> · {ROLE_LABELS[profile.role]}</span>
            ) : null}
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-4 text-sm">
        <Link href="/" className="text-navy-700 hover:text-keyblue-600">
          View site
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
