import Link from "next/link";

/** Admin console top bar. Auth state and account menu are wired up later. */
export function AdminTopbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <p className="text-sm font-semibold text-navy-900">Admin Console</p>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/" className="text-navy-700 hover:text-keyblue-600">
          View site
        </Link>
        <span
          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-navy-700"
          title="Supabase Auth is not wired up yet"
        >
          Not signed in
        </span>
      </div>
    </header>
  );
}
