import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SITE } from "@/lib/constants";
import { PLATFORM } from "@/lib/platform";
import { getSettings } from "@/lib/settings";

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

  // The mark and the two lines of type under it are set in Settings. Nothing
  // here is required: getSettings() falls back to the compiled-in brand, so
  // this screen renders even with the database unreachable.
  const { brand } = await getSettings();

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
            aria-label={`${brand.wordmark} — home`}
            className="group flex flex-col items-center"
          >
            {/* The crossed keys, with a warm halo so the gold lifts off navy. */}
            <span className="relative flex h-24 w-24 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-gold-400/20 blur-2xl transition group-hover:bg-gold-400/30"
              />
              {brand.loginLogoUrl ? (
                <Image
                  src={brand.loginLogoUrl}
                  alt=""
                  width={512}
                  height={512}
                  priority
                  // An uploaded mark is any shape the business chose, so it is
                  // fitted rather than filled — a wide wordmark would
                  // otherwise be cropped to a square.
                  className="relative h-24 w-24 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
                  unoptimized={brand.loginLogoUrl.startsWith("http")}
                />
              ) : null}
            </span>

            <span className="mt-4 block font-serif text-2xl font-bold italic tracking-tight text-white">
              {brand.wordmark}
            </span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              {brand.tagline}
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
              Admin console for {brand.wordmark}.
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

        {/*
          Vendor attribution. Compiled in, not a setting — see lib/platform.
          It sits below the fold of the card on purpose: present at every sign
          in, quiet enough not to compete with the dealership's own mark.
        */}
        <div className="mt-8 border-t border-white/10 pt-5 text-center">
          {/*
            `muted` and `muted/80` rather than white at a low opacity. White at
            30% over this navy lands at 2.6:1 — under the 4.5:1 AA floor for
            body text, so the notice would be there without being readable,
            which is the worst of both. The brand's own muted token clears 7:1
            and 5:1 respectively.
          */}
          <p className="text-[11px] text-muted">
            Powered by{" "}
            <a
              href={PLATFORM.vendorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-white underline decoration-white/30 underline-offset-2 transition hover:text-gold-400 hover:decoration-gold-400 focus-visible:text-gold-400"
            >
              {PLATFORM.vendor}
            </a>
          </p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted/80">
            {PLATFORM.notice}
          </p>
        </div>
      </div>
    </div>
  );
}
