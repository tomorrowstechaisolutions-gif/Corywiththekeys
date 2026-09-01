# The Key Konnect — corywiththekeys-site

**THE OFFICIAL CAR PLUG OF THE PEOPLE**

Automotive sales and personal-brand platform for The Key Konnect / Cory Simek
("Cory With The Keys").

## Stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 16 (App Router)                  |
| Language   | TypeScript (strict)                      |
| Styling    | Tailwind CSS v4                          |
| Database   | Supabase PostgreSQL                      |
| Auth       | Supabase Auth                            |
| Files      | Supabase Storage                         |
| Hosting    | Vercel                                   |
| Source     | GitHub — corywiththekeys/thekeykonnect   |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

## Scripts

| Script              | Does                       |
| ------------------- | -------------------------- |
| `npm run dev`       | Local dev server           |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | `tsc --noEmit`             |

## Layout

```
src/
  app/
    (site)/      public routes — share the site header/footer shell
    admin/       admin console — shares the sidebar/topbar shell
  components/
    layout/      public chrome
    admin/       admin chrome
    ui/          shared primitives
  hooks/         client-side React hooks
  lib/
    supabase/    browser + server Supabase clients
    constants.ts brand, contact, navigation
    env.ts       typed environment access
    utils.ts     small helpers
  services/      data-access layer (per domain) — not implemented yet
  types/         shared types + generated Supabase schema types
```

## Database

Schema lives in `supabase/migrations/`, applied to Supabase project
`jxcwytbeiskjtgvumlws`. 20 tables, RLS on every one.

Regenerate types after any migration:

```bash
npx supabase gen types typescript --project-id jxcwytbeiskjtgvumlws > src/types/database.ts
```

Key rules baked into the database, not just convention:

- **Public writes never use the anon key.** No table has an anonymous
  INSERT policy. Forms go Browser -> Server Action -> service role. See
  `docs/architecture-forms.md`.
- **Feed imports must call `feed_upsert_vehicle()`**, never write to
  `vehicles` directly. Writing directly is treated as a manual edit and
  locks the columns it touched.
- **Manual edits win over feeds.** Editing a vehicle in the admin records
  the touched columns in `locked_fields`; a sync cannot overwrite them
  until `unlock_vehicle_fields()` releases them.
- **No regulated PII.** The site collects prequalification data only —
  banded income and down payment, no DOB, SSN, licence or account data.

## Auth

Staff sign in at `/login` with email + password. There is no public sign-up
route, and new accounts land **inactive** — an admin must activate them and
assign a role before they can see anything.

Access is checked in three independent layers. Each one assumes the layer
above it may be wrong:

| Layer | File | Proves |
| ----- | ---- | ------ |
| Middleware | `src/middleware.ts` | A session exists; redirects to `/login` |
| Layout guard | `src/app/admin/layout.tsx` → `requireStaff()` | The profile is active staff |
| Row Level Security | `supabase/migrations/0004_rls.sql` | What the query may actually return |

Roles are `admin` / `sales` / `viewer`, separate from `profiles.title`, which
is a display job title with no effect on permissions. `/admin/settings` and
`/admin/analytics` call `requireRole('admin')`; the sidebar hides them for
other roles, but hiding a link is presentation — the guard is the gate.

### Creating the first admin

1. Supabase dashboard → **Authentication → Users → Add user** (confirm the email).
2. Promote them:

```sql
update public.profiles
   set role = 'admin', is_active = true, title = 'Head of IT Administrator'
 where email = 'you@example.com';
```

3. Turn public sign-ups off: **Authentication → Sign In / Providers → Email →
   Allow new users to sign up = OFF**.

A trigger prevents demoting, deactivating or deleting the last active admin,
so the console cannot be locked out of itself.

## Inventory

`/admin/inventory` is the working vehicle manager: list with status filters
and search, create, edit, photo upload, publish.

Two things worth knowing before changing it:

- **Admin writes run on the signed-in user's session, never the service
  role.** RLS still applies, and `audit_log` records `auth.uid()` as the
  actor. Under the service role that is null and the audit trail cannot tell
  you who changed a price.
- **Editing a feed-sourced vehicle locks the fields you touched.** The edit
  page lists them and lets you release one back to the feed. This is the
  `locked_fields` mechanism from `0002_inventory_sync.sql`.

Photos go to the `vehicle-photos` bucket. The first upload becomes the lead
image; deleting the lead image promotes the next one automatically.

## Status

Phases 1–4 complete: scaffold, database, auth, inventory manager. The public
site still renders structural placeholders; no page designs yet.
