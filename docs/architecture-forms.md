# Public form pipeline

    Browser form
      -> Server Action (Next.js, runs on the server only)
         1. bot check      Turnstile/reCAPTCHA token + honeypot + time-to-submit
         2. rate limit     public.check_rate_limit(bucket, ip_hash, limit, window)
         3. validation     schema parse, normalise, length + format caps
         4. write          service-role Supabase client, bypasses RLS
         5. log            public.form_submissions row, every outcome
         6. respond        typed result; never a raw database error
      -> Supabase

The anon key can only READ published vehicles, their photos, and published
reviews. There is no anonymous INSERT policy on any table, so a scraped anon
key cannot write to the database at all.

## 1. Validation

Every form has one schema, defined once and used on both sides — the Server
Action parses with it, the client uses it for inline feedback. The server
result is authoritative; client validation is a convenience only.

Rules that apply to all forms:

- Unknown fields are stripped, not merged.
- Every string has a max length. Free text (`message`, `notes`) caps at 2000.
- Phone is normalised to E.164 before storage; a number that will not
  normalise is a validation error, not a stored bad value.
- Email is lowercased and trimmed.
- Enum fields (`employment`, `monthly_income_band`, `down_payment_band`,
  `preferred_contact`) are parsed against the database enum. An unrecognised
  value is rejected rather than coerced to a default.
- Consent booleans must be explicitly `true`; a missing checkbox is a
  validation error on any form that contacts the person afterwards.

Proposed dependency: **zod**. It is the only new package the form layer needs,
and it lets one schema serve validation, TypeScript types, and error messages.
Say the word and I will add it; otherwise I will hand-roll the validators.

## 2. Rate limiting

`public.check_rate_limit(bucket, identifier, limit, window_seconds)` is an
atomic fixed-window counter in Postgres. It returns `true` when the request is
allowed. No Redis, no extra service, works on serverless.

Identifier is `sha256(ip + RATE_LIMIT_SALT)` — the raw IP is never stored in
this table. Starting limits:

| Bucket             | Limit | Window |
| ------------------ | ----- | ------ |
| `lead`             | 5     | 10 min |
| `prequalification` | 3     | 30 min |
| `trade_in`         | 3     | 30 min |
| `contact`          | 5     | 10 min |
| `review`           | 2     | 60 min |

A second bucket keyed on the submitted phone/email catches one person
hammering from rotating addresses.

If volume ever outgrows Postgres, swap the implementation for Upstash behind
the same function signature — callers only ever see a boolean.

`public.prune_rate_limits()` clears expired windows; run it nightly.

## 3. Bot and spam protection

Four independent hooks, all recorded on `form_submissions` whether or not they
fire:

1. **Honeypot** — a hidden field real users never fill. Filled means bot.
2. **Time-to-submit** — a form completed in under ~2 seconds is scripted.
3. **Token check** — Cloudflare Turnstile (free, no cookie banner
   implications) verified server-side. reCAPTCHA works the same way if
   preferred. `bot_provider`, `bot_check_passed` and `bot_score` are stored.
4. **Content signals** — link count, non-Latin runs, known spam phrases,
   duplicate body hash within 24h. Collected into `spam_signals`.

Rejected submissions still get a `form_submissions` row so patterns are
visible in `/admin/analytics`. They never create a lead.

## 4. Logging

Two separate trails, deliberately:

- **`form_submissions`** — abuse and observability. Hashed IP, user agent,
  outcome, spam signals, validation errors. Admin-read only.
- **`audit_log`** — who changed what inside the admin. Full before/after for
  operational tables; field names only for tables holding personal data, so
  the audit trail does not become a second copy of customer PII.

The only raw IP anywhere is `prequalifications.consent_ip`, retained as proof
of contact consent.

## 5. Error handling

Server Actions return a discriminated union:

    { ok: true,  id }
  | { ok: false, code: 'validation', fieldErrors }
  | { ok: false, code: 'rate_limit' | 'bot_check' | 'server' }

Database errors are caught, logged with the Supabase error code, and returned
as `code: 'server'` with a generic message. Constraint names, table names and
driver text never reach the browser.

## 6. Retention

Not yet implemented — decide before launch:

- `form_submissions` for rejected submissions: 90 days
- `rate_limits`: 1 day
- `consent_ip` / `consent_user_agent`: as long as the consent is relied on
- Lost leads and their personal fields: policy to be set with Cory
