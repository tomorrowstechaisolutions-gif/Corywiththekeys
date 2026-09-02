import QRCode from "qrcode";

import { SITE } from "@/lib/constants";

/**
 * Where the phone should land.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL for us, so a preview deployment
 * still prints a QR that points at production rather than at itself. The
 * brand domain is the last resort.
 */
function intakeUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null);

  return `${(configured ?? SITE.url).replace(/\/+$/, "")}/admin/intake`;
}

/**
 * The QR a person on the lot scans to start an intake on their phone.
 *
 * Rendered as an inline SVG rather than a data-URI image so it stays crisp
 * when printed and taped to the office wall, which is what will happen to it.
 */
export async function IntakeQrPanel() {
  const url = intakeUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  return (
    <details className="group rounded-lg border border-slate-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5">
        <span>
          <span className="block text-sm font-bold text-navy-900">
            Add a vehicle from your phone
          </span>
          <span className="mt-0.5 block text-xs text-navy-700">
            Scan this, scan the VIN, take photos. It comes back here for review.
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-xs font-semibold uppercase tracking-wide text-keyblue-600"
        >
          <span className="group-open:hidden">Show code</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>

      <div className="flex flex-col items-center gap-4 border-t border-slate-100 px-4 py-6 sm:flex-row sm:items-start">
        <div
          className="shrink-0 rounded-lg border border-slate-200 bg-white p-3 [&>svg]:h-40 [&>svg]:w-40"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm text-navy-800">
            Anyone scanning this signs in with their own staff account first, so
            only people you have given an account can add vehicles.
          </p>

          <p className="mt-3 break-all font-mono text-xs text-navy-700/70">
            {url}
          </p>

          {isLocal ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              This points at your development machine, so a phone cannot reach
              it. Once the site is deployed, set NEXT_PUBLIC_SITE_URL and the
              code will point at the live address.
            </p>
          ) : (
            <p className="mt-3 text-xs text-navy-700/70">
              Print it and tape it up where cars get checked in.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}
