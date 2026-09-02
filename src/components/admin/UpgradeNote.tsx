/**
 * A note about what a bigger version would do.
 *
 * Rules this component exists to enforce, because they are easy to break one
 * screen at a time:
 *
 *   It never blocks anything. No overlay, no disabled button, no counter
 *   ticking down to a wall. Everything the console can do, it does.
 *
 *   It only appears where the gap is real. "This list tells you who to chase
 *   but does not chase them" is true and useful to know. A banner on every
 *   screen saying "upgrade for more" is noise, and noise is what teaches
 *   people to stop reading.
 *
 *   It says what the feature would DO, not what tier it belongs to. Somebody
 *   should be able to decide whether they want it without a price list.
 *
 * A starter tier that works properly and is honest about its edges is what
 * makes somebody trust the paid one. One that nags is what makes them go back
 * to notes on their phone.
 */
export function UpgradeNote({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-navy-700/70">
        What this does not do yet
      </p>
      <p className="mt-1.5 text-sm font-semibold text-navy-900">{title}</p>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-700">
        {body}
      </p>
    </aside>
  );
}
