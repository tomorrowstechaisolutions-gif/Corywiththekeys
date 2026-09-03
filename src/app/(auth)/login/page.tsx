import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      {/*
        Two soft washes of the truck's blue behind the card so the page is not
        a flat block of navy. Purely decorative, so they are hidden from
        assistive tech and never intercept a click.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(60rem_36rem_at_50%_-10%,rgba(47,97,232,0.28),transparent_65%),radial-gradient(40rem_28rem_at_50%_115%,rgba(18,41,109,0.55),transparent_70%)]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label={`${SITE.name} — home`}
            className="group flex flex-col items-center"
          >
            {/* The crossed keys, with a warm halo so the gold lifts off navy. */}
            <span className="relative flex h-24 w-24 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-gold-400/20 blur-2xl transition group-hover:bg-gold-400/30"
              />
              <Image
                src="/brand/key-mark.png"
                alt=""
                width={512}
                height={512}
                priority
                className="relative h-24 w-24 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
              />
            </span>

            <span className="mt-4 block font-serif text-2xl font-bold italic tracking-tight text-white">
              {SITE.name}
            </span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              {SITE.tagline}
            </span>
          </Link>

          {/* Gold hairline, fading out at both ends. */}
          <span
            aria-hidden
            className="mt-5 h-px w-24 bg-[linear-gradient(90deg,transparent,var(--color-gold-500),transparent)]"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div aria-hidden className="h-1 w-full bg-gold-500" />

          <div className="p-7">
            <h1 className="text-lg font-bold text-navy-900">Staff sign in</h1>
            <p className="mt-1 text-sm text-navy-700">
              Admin console for {SITE.name}.
            </p>

            {notice ? (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {notice}
              </p>
            ) : null}

            <div className="mt-6">
              <LoginForm next={next ?? "/admin/dashboard"} />
            </div>

            <p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-relaxed text-navy-700">
              Accounts are created by an administrator. There is no public
              sign-up.
            </p>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-muted">
          <Link
            href="/"
            className="transition hover:text-gold-400 focus-visible:text-gold-400"
          >
            &larr; Back to {SITE.domain}
          </Link>
        </p>
      </div>
    </div>
  );
}
