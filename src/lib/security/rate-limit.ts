import { createAdminClient } from "@/lib/supabase/server";

/**
 * Per-form limits. Deliberately generous for a person filling in a form
 * twice, tight enough that a script gets nowhere.
 */
export const RATE_LIMITS = {
  lead: { limit: 5, windowSeconds: 600 },
  find_my_car: { limit: 4, windowSeconds: 1800 },
  prequalification: { limit: 3, windowSeconds: 1800 },
  trade_in: { limit: 3, windowSeconds: 1800 },
  contact: { limit: 5, windowSeconds: 600 },
  // A shopper legitimately asks about several cars in one sitting, so this is
  // looser than the application forms.
  vehicle_inquiry: { limit: 8, windowSeconds: 600 },
  review: { limit: 2, windowSeconds: 3600 },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

/**
 * Fixed-window counter, evaluated atomically in Postgres by
 * public.check_rate_limit(). Returns true when the call is ALLOWED.
 *
 * Fails OPEN. A rate limiter that is itself broken must not stop real
 * customers from reaching Cory — the honeypot, timing check and validation
 * still stand behind it.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string | null,
): Promise<boolean> {
  if (!identifier) return true;

  const { limit, windowSeconds } = RATE_LIMITS[bucket];

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_bucket: bucket,
      p_identifier: identifier,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("[rate-limit] check failed", error.message);
      return true;
    }

    return data !== false;
  } catch (cause) {
    console.error("[rate-limit] unavailable", cause);
    return true;
  }
}
