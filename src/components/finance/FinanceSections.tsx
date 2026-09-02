import Image from "next/image";
import type { ReactNode } from "react";

import { ApplyButton } from "@/components/finance/ApplyButton";
import { InventoryLink } from "@/components/finance/InventoryLink";
import { Container } from "@/components/ui/Container";
import { BANNER, HERO, STEPS, TRUST } from "@/data/finance";

/** Thin gold line icons, drawn inline. */
const ICONS: Record<string, ReactNode> = {
  credit: (
    <>
      <path d="M12 3l7.5 2.6v5.6c0 4.6-3.1 7.6-7.5 8.8-4.4-1.2-7.5-4.2-7.5-8.8V5.6L12 3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  secure: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9" rx="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14v2" />
    </>
  ),
  works: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.8" cy="9.6" r="2" />
      <circle cx="18.2" cy="9.6" r="2" />
      <path d="M7.6 17.2a4.6 4.6 0 0 1 8.8 0" />
      <path d="M2.6 16.4a3.6 3.6 0 0 1 4.2-2.5M21.4 16.4a3.6 3.6 0 0 0-4.2-2.5" />
    </>
  ),
  obligation: (
    <>
      <path d="M7 11V7.5a2 2 0 0 1 4 0V11" />
      <path d="M11 11V6a1.8 1.8 0 0 1 3.6 0v5" />
      <path d="M14.6 11.5V8.6a1.8 1.8 0 0 1 3.6 0v6.2a5.6 5.6 0 0 1-5.6 5.6h-1.3a5.4 5.4 0 0 1-4.2-2l-3-3.8a1.7 1.7 0 0 1 2.5-2.2L7 13.4" />
    </>
  ),
  response: (
    <>
      <rect x="3.5" y="5" width="17" height="14.5" rx="2" />
      <path d="M3.5 9.5h17M8 3.5V6.5M16 3.5V6.5" />
      <path d="m9.5 14 1.8 1.8 3.4-3.6" />
    </>
  ),
};

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

/**
 * Hero.
 *
 * The photograph carries the right-hand side and dissolves into black before
 * it reaches the copy, so nothing is set over the car or the person in it. On
 * a phone there is no room for two columns, so the image becomes its own band
 * beneath the words rather than a backdrop they fight with.
 */
export function FinanceHero() {
  return (
    <section className="relative isolate overflow-hidden bg-finance-bg text-white">
      <div className="absolute inset-y-0 right-0 hidden w-[64%] lg:block">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="64vw"
          className="object-cover object-[38%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,#040a1c_0%,rgba(4,10,28,0.95)_11%,rgba(4,10,28,0.6)_26%,rgba(4,10,28,0.15)_42%,transparent_58%)]"
        />
      </div>

      <Container className="relative py-12 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold-500">
            {HERO.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
            {HERO.title}
            <br />
            <span className="text-gold-500">{HERO.titleAccent}</span>
          </h1>

          <div className="mt-5 space-y-1 text-sm leading-relaxed text-finance-muted sm:text-base">
            {HERO.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-4 sm:gap-x-0">
            {HERO.trust.map((item, index) => (
              <li
                key={item.key}
                className={`flex max-w-[8.5rem] flex-col gap-2 sm:max-w-[9.5rem] sm:px-5 ${
                  index > 0 ? "sm:border-l sm:border-keyblue-600/40" : "sm:pl-0"
                }`}
              >
                <span className="text-gold-500">
                  <Icon name={item.key} />
                </span>
                <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-white/85">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <ApplyButton placement="hero">Start Secure Application</ApplyButton>
            <p className="mt-3 flex items-center gap-2 text-xs text-finance-muted">
              <Icon name="secure" className="h-3.5 w-3.5 text-gold-500" />
              {HERO.ctaNote}
            </p>
          </div>
        </div>
      </Container>

      {/* Phone and tablet: the photograph as its own band. */}
      <div className="relative h-60 w-full sm:h-72 lg:hidden">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[42%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,#040a1c_0%,transparent_28%,rgba(4,10,28,0.55)_100%)]"
        />
      </div>
    </section>
  );
}

export function FinanceProcess() {
  return (
    <section className="bg-finance-bg py-12 lg:py-16">
      <Container>
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-gold-500">
          How It Works
        </p>
        <h2 className="mt-3 text-center text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
          Your Road To Approval
        </h2>

        <ol className="mt-9 grid gap-4 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="relative isolate flex min-h-[19rem] flex-col overflow-hidden rounded-lg border border-keyblue-600/55 bg-finance-panel"
            >
              <Image
                src={step.image}
                alt={step.imageAlt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-right"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_right,#040a1c_0%,rgba(4,10,28,0.95)_38%,rgba(4,10,28,0.55)_62%,rgba(4,10,28,0.15)_100%)]"
              />

              <div className="relative flex flex-1 flex-col p-6">
                <span
                  aria-hidden
                  className="text-4xl font-extrabold leading-none text-gold-500 sm:text-5xl"
                >
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-extrabold uppercase leading-tight tracking-tight text-white">
                  <span className="sr-only">Step {step.number}: </span>
                  {step.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>

                <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-finance-muted">
                  {step.body}
                </p>

                <div className="mt-auto pt-5">
                  {step.applyButton ? (
                    <ApplyButton placement="step-02" variant="outline">
                      Start Secure Application
                    </ApplyButton>
                  ) : null}
                  {step.link ? (
                    <InventoryLink href={step.link.href} label={step.link.label} />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-9 text-center">
          <ApplyButton placement="process">Start Secure Application</ApplyButton>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-finance-muted">
            <Icon name="secure" className="h-3.5 w-3.5 text-gold-500" />
            {HERO.ctaNote}
          </p>
        </div>
      </Container>
    </section>
  );
}

export function FinanceTrustStrip() {
  return (
    <section className="bg-finance-bg pb-12">
      <Container>
        <ul className="grid gap-6 rounded-lg border border-keyblue-600/45 bg-finance-panel p-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {TRUST.map((item, index) => (
            <li
              key={item.key}
              className={`text-center lg:px-6 ${
                index > 0 ? "lg:border-l lg:border-keyblue-600/35" : ""
              }`}
            >
              <span className="inline-flex text-gold-500">
                <Icon name={item.key} className="h-7 w-7" />
              </span>
              <h3 className="mt-3 text-[11px] font-bold uppercase tracking-wider text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-finance-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function FinanceBrandBanner() {
  return (
    <section className="bg-finance-bg pb-12">
      <Container>
        <div className="grid overflow-hidden rounded-lg border border-keyblue-600/55 bg-finance-panel lg:grid-cols-[1fr_1.15fr_auto]">
          <div className="relative h-48 lg:h-auto lg:min-h-[15rem]">
            <Image
              src={BANNER.image}
              alt={BANNER.imageAlt}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,10,28,0.75),transparent_60%)] lg:bg-[linear-gradient(to_right,transparent_55%,#0a1533_100%)]"
            />
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
              {BANNER.title}
              <br />
              <span className="text-gold-500">{BANNER.titleAccent}</span>
            </h2>
            <div className="mt-4 space-y-0.5 text-sm leading-relaxed text-finance-muted">
              {BANNER.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p
              className="mt-5 text-3xl leading-none text-gold-500"
              style={{ fontFamily: "var(--font-signature)" }}
            >
              {BANNER.signature}
            </p>
          </div>

          <div className="border-t border-keyblue-600/45 p-6 sm:p-8 lg:w-72 lg:border-l lg:border-t-0">
            <h3 className="text-base font-extrabold uppercase leading-tight tracking-tight text-white">
              {BANNER.ctaTitle.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h3>
            <ApplyButton placement="brand-banner" className="mt-5 w-full">
              {BANNER.cta}
            </ApplyButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
