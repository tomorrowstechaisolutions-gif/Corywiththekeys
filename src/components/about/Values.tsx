import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { STATS, VALUES } from "@/data/about";

/**
 * Line icons drawn inline — four shapes is not worth an icon dependency, and
 * inline SVG means they inherit the brand blue and cost no extra request.
 */
const ICONS: Record<string, ReactNode> = {
  // Two hands clasped.
  honesty: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  // Shield with an upright bar — the integrity mark from the comp.
  integrity: (
    <>
      <path d="M12 3l7.5 2.6v5.6c0 4.6-3.1 7.6-7.5 8.8-4.4-1.2-7.5-4.2-7.5-8.8V5.6L12 3z" />
      <path d="M12 8.5v4.2" />
      <path d="M12 15.4v.1" />
    </>
  ),
  // A small group.
  community: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.8" cy="9.6" r="2" />
      <circle cx="18.2" cy="9.6" r="2" />
      <path d="M7.6 17.2a4.6 4.6 0 018.8 0" />
      <path d="M2.6 16.4a3.6 3.6 0 014.2-2.5M21.4 16.4a3.6 3.6 0 00-4.2-2.5" />
    </>
  ),
  // A key.
  opportunity: (
    <>
      <circle cx="8" cy="12" r="3.6" />
      <path d="M11.6 12H21" />
      <path d="M17.6 12v3.4M20.4 12v2.4" />
    </>
  ),
};

export function Values() {
  return (
    <section className="bg-navy-950 py-8 lg:py-12">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-keyblue-400">
          What We Stand For
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          People Over Profit
        </h2>

        <div
          className={
            STATS.confirmed
              ? "mt-7 grid items-center gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-12"
              : "mt-7"
          }
        >
          <ul className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
            {VALUES.map((value, index) => (
              <li
                key={value.key}
                className={`px-2 text-center sm:px-4 ${
                  index > 0 ? "sm:border-l sm:border-white/10" : ""
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto h-9 w-9 text-keyblue-500"
                  aria-hidden
                >
                  {ICONS[value.key]}
                </svg>

                <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-white">
                  {value.label}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>

          {/* Renders only while the figures are marked confirmed. */}
          {STATS.confirmed ? (
            <ul className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/12 bg-white/[0.03]">
              {STATS.items.map((stat, index) => (
                <li
                  key={stat.label}
                  className={`px-4 py-6 text-center ${
                    index % 2 === 0 ? "border-r border-white/12" : ""
                  } ${index < 2 ? "border-b border-white/12" : ""}`}
                >
                  <p className="text-3xl font-extrabold leading-none text-keyblue-400">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider leading-tight text-white/55">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
