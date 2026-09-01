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

## Status

Phase 1 scaffold and phase 2 schema complete. Routes still render
structural placeholders; no auth wiring and no page designs yet.

`/admin` is currently unprotected — middleware lands with the auth phase,
before anything deploys.
