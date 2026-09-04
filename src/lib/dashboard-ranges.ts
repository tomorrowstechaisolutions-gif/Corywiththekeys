/**
 * The dashboard's date-range vocabulary.
 *
 * Its own file with no imports, and that is the whole point. The picker is a
 * client component and the figures are worked out on the server, so both
 * sides need these names — but `lib/dashboard` is `server-only`, and a client
 * component importing a value from it drags the Supabase server client into
 * the browser bundle and breaks the build.
 *
 * Same pattern as `lib/buckets`: constants both sides need live in a module
 * that imports nothing.
 */
export const RANGE_KEYS = ["7d", "30d", "month", "quarter"] as const;

export type RangeKey = (typeof RANGE_KEYS)[number];

export const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
  quarter: "Last 90 days",
};

export function isRangeKey(value: string | undefined): value is RangeKey {
  return !!value && (RANGE_KEYS as readonly string[]).includes(value);
}
