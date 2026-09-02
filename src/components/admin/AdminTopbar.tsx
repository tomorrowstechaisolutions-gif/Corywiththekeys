import Link from "next/link";

import { signOut } from "@/app/(auth)/login/actions";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { navFor } from "@/lib/admin-nav";
import { displayName, ROLE_LABELS, type Profile } from "@/lib/auth";

/** Admin console top bar. Shows who is signed in and how to leave. */
export function AdminTopbar({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6">
      <AdminMobileNav items={navFor(profile)} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy-900">
          {displayName(profile)}
        </p>
        <p className="truncate text-xs text-navy-700">
          {profile.title ?? ROLE_LABELS[profile.role]}
          {profile.title ? (
            <span className="text-muted"> · {ROLE_LABELS[profile.role]}</span>
          ) : null}
        </p>
      </div>

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
