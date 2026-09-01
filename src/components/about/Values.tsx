import { Container } from "@/components/ui/Container";
import { STATS, VALUES } from "@/data/about";

/** Simple line icons, one per value. Inline so there is no icon dependency. */
const ICONS: Record<string, React.ReactNode> = {
  honesty: (
    <path d="M3 13l4-4 3 3 4-5 3 3 4-4M3 13v5a1 1 0 001 1h16a1 1 0 001-1v-5" />
  ),
  integrity: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4" />,
  community: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.2" />
      <path d="M3 20a6 6 0 0112 0M15.5 20a5 5 0 015.5-4.6" />
    </>
  ),
  opportunity: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M17 12v3.5M20 12v2.5" />
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
              ? "mt-7 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10"
              : "mt-7"
          }
        >
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            {VALUES.map((value) => (
              <li key={value.key} className="text-center sm:text-left">
                <span className="inline-flex text-keyblue-400 sm:mb-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8"
                    aria-hidden
                  >
                    {ICONS[value.key]}
                  </svg>
                </span>
                <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-white">
                  {value.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>

          {/* Only renders once the figures have been confirmed as accurate. */}
          {STATS.confirmed ? (
            <ul className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10">
              {STATS.items.map((stat) => (
                <li
                  key={stat.label}
                  className="border-b border-r border-white/10 p-5 text-center last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(n+3)]:border-b-0"
                >
                  <p className="text-2xl font-extrabold text-keyblue-400 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/55">
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
