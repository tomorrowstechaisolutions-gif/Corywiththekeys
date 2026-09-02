import type { ReactNode } from "react";

import type { ExternalUrl } from "@/data/cory-links";

/** Blue uppercase section label with an optional "view all" on the right. */
export function SectionHeading({
  title,
  viewAllLabel,
  viewAllUrl,
  id,
  children,
}: {
  title: string;
  viewAllLabel?: string;
  viewAllUrl?: ExternalUrl;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div id={id} className="flex flex-wrap items-baseline justify-between gap-3 scroll-mt-20">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold-500 sm:text-base">
        {title}
      </h2>
      {viewAllUrl && viewAllLabel ? (
        <a
          href={viewAllUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition hover:gap-2.5 hover:text-white"
        >
          {viewAllLabel} <span aria-hidden>→</span>
        </a>
      ) : null}
      {children}
    </div>
  );
}
