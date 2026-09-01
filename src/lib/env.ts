/**
 * Environment access with explicit, readable failures.
 * No values are hard-coded here — see .env.example for the required keys.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Safe for the browser bundle. */
export const publicEnv = {
  get supabaseUrl(): string {
    return required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get supabaseAnonKey(): string {
    return required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
  /** Cloudflare Turnstile site key. Absent means bot checking is off. */
  get turnstileSiteKey(): string | undefined {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;
  },
};

/** Server-only. Never import this from a Client Component. */
export const serverEnv = {
  get supabaseServiceRoleKey(): string {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },

  /**
   * Whether public form submissions can be written at all.
   *
   * Public writes go through the service role — there is no anonymous INSERT
   * policy anywhere. Checking first lets a form fail with a sentence a person
   * can act on instead of an unhandled exception.
   */
  get hasServiceRole(): boolean {
    return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  },

  /**
   * Salt for hashing IP addresses in the abuse log.
   *
   * A raw IP is never stored in form_submissions. In production this must be
   * set; the development fallback keeps local testing working but must not
   * ship, so it is loud about it.
   */
  get rateLimitSalt(): string {
    const salt = process.env.RATE_LIMIT_SALT;
    if (salt) return salt;

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing environment variable: RATE_LIMIT_SALT. Required in production so hashed IPs are not reversible.",
      );
    }
    return "development-only-salt-do-not-use-in-production";
  },

  /** Cloudflare Turnstile secret. Absent means bot checking is off. */
  get turnstileSecretKey(): string | undefined {
    return process.env.TURNSTILE_SECRET_KEY || undefined;
  },
};
