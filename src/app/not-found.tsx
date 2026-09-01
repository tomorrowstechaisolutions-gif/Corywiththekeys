import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyblue-600">
        404
      </p>
      <h1 className="text-2xl font-bold text-navy-900">Page not found</h1>
      <Link
        href="/"
        className="rounded-md bg-keyblue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-keyblue-500"
      >
        Back to home
      </Link>
    </div>
  );
}
