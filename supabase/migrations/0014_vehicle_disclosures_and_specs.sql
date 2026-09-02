-- Disclosures and the spec fields a used-car listing is expected to carry.
--
-- Title status leads deliberately. It is a disclosure rather than a
-- convenience, and it matters most to the buyers this dealership serves —
-- people working with damaged credit are the ones most likely to have been
-- sold a bad car before, and the ones who check. It defaults to
-- 'not_disclosed' rather than 'clean' so that silence is never mistaken for a
-- clean title; nothing claims a clean title unless a person said so.

create type public.title_status as enum (
  'clean', 'salvage', 'rebuilt', 'flood', 'lemon', 'not_disclosed'
);

create type public.warranty_status as enum (
  'as_is', 'remaining_factory', 'dealer_warranty', 'certified', 'not_specified'
);

alter table public.vehicles
  add column title_status public.title_status not null default 'not_disclosed',
  add column history_report_url text,
  add column warranty_status public.warranty_status not null default 'not_specified',
  add column warranty_details text,
  add column doors smallint check (doors between 1 and 8),
  add column seating smallint check (seating between 1 and 20),
  add column cylinders smallint check (cylinders between 1 and 16),
  add column mpg_city smallint check (mpg_city between 0 and 200),
  add column mpg_highway smallint check (mpg_highway between 0 and 200),
  add column video_url text;

comment on column public.vehicles.title_status is
  'Branded-title disclosure. Defaults to not_disclosed so an unanswered field never reads as a clean title.';
comment on column public.vehicles.history_report_url is
  'Link to a Carfax or AutoCheck report for this VIN.';
comment on column public.vehicles.video_url is
  'Walkaround video — YouTube, or any URL the player can resolve.';

-- Feeds may set the new columns too, so a partner feed that carries them is
-- not silently dropping data. Everything here still passes through the same
-- whitelist and the same per-field locks.
create or replace function public.syncable_vehicle_columns()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'vin', 'stock_number', 'year', 'make', 'model', 'trim', 'body_type',
    'mileage', 'exterior_color', 'interior_color', 'transmission',
    'drivetrain', 'fuel_type', 'engine', 'price', 'monthly_payment',
    'down_payment', 'description', 'features', 'status',
    'title_status', 'history_report_url', 'warranty_status',
    'warranty_details', 'doors', 'seating', 'cylinders',
    'mpg_city', 'mpg_highway', 'video_url'
  ]::text[]
$$;
