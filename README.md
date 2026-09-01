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

## Status

Scaffold only. Every route renders a structural placeholder that states what
it will contain. No database tables, no auth wiring, no page designs yet.
