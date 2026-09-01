import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/constants";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Staff Sign In",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  unauthorized: "Please sign in to open the admin console.",
  forbidden: "Your account does not have access to that page.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const notice = error ? ERRORS[error] : undefined;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-navy-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <span className="block text-xl font-bold text-white">
              {SITE.name}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted">
              {SITE.tagline}
            </span>
          </Link>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-lg font-bold text-navy-900">Staff sign in</h1>
          <p className="mt-1 text-sm text-navy-700">
            Admin console for {SITE.name}.
          </p>

          {notice ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {notice}
            </p>
          ) : null}

          <div className="mt-5">
            <LoginForm next={next ?? "/admin/dashboard"} />
          </div>

          <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-navy-700">
            Accounts are created by an administrator. There is no public
            sign-up.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-white">
            &larr; Back to {SITE.domain}
          </Link>
        </p>
      </div>
    </div>
  );
}
