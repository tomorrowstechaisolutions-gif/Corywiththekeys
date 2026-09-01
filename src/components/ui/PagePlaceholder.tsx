import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";

/**
 * Structural stand-in used by every route until real page work begins.
 * Renders the route's identity and its planned scope — no design decisions.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
  scope,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  scope?: readonly string[];
  children?: ReactNode;
}) {
  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyblue-600">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-base leading-7 text-navy-700">{description}</p>

        {scope && scope.length > 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Planned for this route
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-navy-700">
              {scope.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-keyblue-600">
                    &middot;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}
      </div>
    </Container>
  );
}
