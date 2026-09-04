import Link from "next/link";

import type { BriefItem } from "@/lib/dashboard";

const TONE_DOT: Record<BriefItem["tone"], string> = {
  urgent: "bg-red-400",
  warn: "bg-gold-400",
  info: "bg-keyblue-400",
};

/**
 * The day's short list.
 *
 * Every line is counted from data already in the database — overdue follow-up
 * dates, vehicles past their aging mark, appointments still unconfirmed. None
 * of it is generated, and nothing here has been acted on: there is no
 * automation wired up yet, so the card offers to open the AI Command Center
 * rather than claiming it handled anything.
 */
export function AiDailyBrief({ items }: { items: readonly BriefItem[] }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl bg-navy-950 text-white shadow-sm ring-1 ring-white/10">
      <header className="flex items-center gap-2.5 px-5 pt-4">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-keyblue-600 text-[11px] font-bold">
          AI
        </span>
        <div>
          <h2 className="text-sm font-semibold">Daily brief</h2>
          <p className="text-[11px] text-white/50">
            Counted from your live records
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 pb-4 pt-4">
        {items.length === 0 ? (
          <div className="rounded-lg bg-white/5 px-4 py-5">
            <p className="text-sm font-semibold">Nothing needs chasing</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              No overdue follow-ups, no unconfirmed appointments and nothing
              aging on the lot.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/10"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[item.tone]}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">
                      {item.label}
                    </span>
                    <span className="block text-[11px] leading-snug text-white/50">
                      {item.detail}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-white/70">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 pb-5">
        <Link
          href="/admin/ai"
          className="block rounded-lg bg-keyblue-600 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-keyblue-500"
        >
          Open AI Command Center
        </Link>
        <p className="mt-2 text-center text-[10px] text-white/40">
          Nothing here has been actioned — the assistant is not connected yet.
        </p>
      </div>
    </section>
  );
}
