import Link from "next/link";

/** Full-width CTA dropped into the grid after the first few vehicles. */
export function FinancingBanner() {
  return (
    <section className="col-span-full overflow-hidden rounded-xl bg-navy-950 text-white">
      <div className="flex flex-col items-center gap-5 px-6 py-7 text-center sm:px-8 lg:flex-row lg:justify-between lg:gap-8 lg:text-left">
        <div className="flex items-center gap-5">
          <span
            aria-hidden
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-keyblue-600/20 text-2xl text-keyblue-400 sm:flex"
          >
            ⚿
          </span>
          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              Not sure what fits your budget?
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/75">
              Tell Cory what you&rsquo;re looking for and what payment
              you&rsquo;re comfortable with. We&rsquo;ll help find the right
              vehicle.
            </p>
          </div>
        </div>

        <Link
          href="/apply"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-keyblue-600 px-6 py-3 text-sm font-bold transition hover:bg-keyblue-500"
        >
          Get Pre-Approved <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
