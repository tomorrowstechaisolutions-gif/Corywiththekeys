-- =====================================================================
-- The Key Konnect — core schema
-- 0001_init.sql : extensions, enums, core tables
--
-- Privacy posture for the initial release:
--   The public site collects PREQUALIFICATION data only — contact details,
--   employment status, and banded income / down-payment ranges. There is no
--   SSN, no date of birth, no exact income, no bank or card data, and no
--   driver's licence number anywhere in this schema. A regulated lender
--   application is expected to live with a third-party provider; see the
--   `lender_applications` table, which stores only a pointer to it.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'sales', 'viewer');

create type vehicle_status as enum ('draft', 'available', 'pending', 'sold', 'archived');
create type vehicle_source as enum ('owned', 'partner');

-- How a vehicle record arrived. Present from day one so partner feed
-- automation can be switched on later without altering `vehicles`.
create type ingestion_method as enum (
  'manual',        -- typed into the admin by staff
  'csv_import',    -- one-off spreadsheet upload
  'xml_feed',      -- scheduled XML/ADF style feed
  'json_api',      -- scheduled JSON API pull
  'partner_api'    -- direct partner integration
);

create type sync_state as enum ('not_synced', 'synced', 'stale', 'error', 'orphaned');

create type feed_type as enum ('manual_upload', 'csv', 'xml', 'json_api', 'partner_api');
create type feed_run_status as enum ('running', 'success', 'partial', 'failed');

create type lead_status as enum (
  'new', 'contacted', 'working', 'appointment_set',
  'prequalified', 'won', 'lost'
);
create type lead_source as enum (
  'homepage_form', 'vehicle_inquiry', 'financing', 'prequalification',
  'trade_in', 'contact_form', 'phone', 'walk_in',
  'referral', 'social', 'other'
);

create type prequal_status as enum (
  'new', 'contacted', 'prequalified', 'referred_to_lender',
  'not_qualified', 'converted', 'closed'
);

create type employment_status as enum (
  'employed_full_time', 'employed_part_time', 'self_employed',
  'military', 'retired', 'student', 'not_employed', 'other',
  'prefer_not_to_say'
);

-- Banded, never exact. Widening or renaming a band later is a single
-- enum change and does not touch application data.
create type income_range as enum (
  'under_2000', 'from_2000_to_2999', 'from_3000_to_3999',
  'from_4000_to_4999', 'from_5000_to_6999', 'from_7000_plus',
  'prefer_not_to_say'
);

create type down_payment_range as enum (
  'none', 'under_500', 'from_500_to_999', 'from_1000_to_2499',
  'from_2500_to_4999', 'from_5000_plus', 'undecided'
);

create type contact_method as enum ('phone', 'text', 'email', 'any');

create type trade_in_status as enum (
  'submitted', 'appraising', 'offer_made', 'accepted', 'declined', 'expired'
);

create type appointment_type as enum ('test_drive', 'delivery', 'consultation');
create type appointment_status as enum (
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create type deal_stage as enum (
  'new', 'qualified', 'prequalified', 'vehicle_selected',
  'lender_submitted', 'approved', 'paperwork', 'delivered', 'lost'
);

create type message_channel as enum ('sms', 'email', 'web_form', 'phone', 'other');
create type message_direction as enum ('inbound', 'outbound');

create type review_status as enum ('pending', 'published', 'hidden');

-- ---------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles — staff accounts, keyed to auth.users
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        user_role not null default 'viewer',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role) where is_active;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- partner_lots — dealers and lots that supply inventory
-- ---------------------------------------------------------------------
create table public.partner_lots (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  address_line1     text,
  address_line2     text,
  city              text,
  state             text,
  postal_code       text,
  commission_notes  text,
  display_on_site   boolean not null default false,
  is_active         boolean not null default true,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index partner_lots_active_idx on public.partner_lots (is_active);

-- ---------------------------------------------------------------------
-- inventory_feeds — one row per import channel.
-- A manual-entry lot needs no feed row; a lot can have several.
-- Credentials are NEVER stored here: `credentials_ref` names a secret held
-- in Supabase Vault or a Vercel environment variable.
-- ---------------------------------------------------------------------
create table public.inventory_feeds (
  id               uuid primary key default gen_random_uuid(),
  partner_lot_id   uuid references public.partner_lots (id) on delete cascade,
  name             text not null,
  type             feed_type not null default 'manual_upload',
  endpoint_url     text,
  credentials_ref  text,
  field_mapping    jsonb not null default '{}'::jsonb,
  schedule_cron    text,
  auto_archive_missing boolean not null default true,
  is_active        boolean not null default false,
  last_run_at      timestamptz,
  last_run_status  feed_run_status,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index inventory_feeds_partner_idx on public.inventory_feeds (partner_lot_id);
create index inventory_feeds_active_idx  on public.inventory_feeds (is_active);

-- ---------------------------------------------------------------------
-- vehicles — one table for every unit regardless of origin.
--
-- Origin is described by three independent columns so nothing needs
-- restructuring when feeds arrive:
--   source           owned vs partner (who the unit belongs to)
--   ingestion_method how the row got here (manual today, feed later)
--   feed_id          which feed produced it, null for manual entry
--
-- Manual overrides: `locked_fields` lists columns a human edited. The
-- trigger in 0002 refuses to let a sync overwrite them.
-- ---------------------------------------------------------------------
create table public.vehicles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  vin                text,
  stock_number       text,

  year               smallint not null,
  make               text not null,
  model              text not null,
  trim               text,
  body_type          text,
  mileage            integer,
  exterior_color     text,
  interior_color     text,
  transmission       text,
  drivetrain         text,
  fuel_type          text,
  engine             text,

  price              numeric(10, 2),
  monthly_payment    numeric(10, 2),
  down_payment       numeric(10, 2),

  description        text,
  features           text[] not null default '{}',

  status             vehicle_status not null default 'draft',
  is_featured        boolean not null default false,

  -- origin / sync
  source             vehicle_source not null default 'owned',
  partner_lot_id     uuid references public.partner_lots (id) on delete set null,
  ingestion_method   ingestion_method not null default 'manual',
  feed_id            uuid references public.inventory_feeds (id) on delete set null,
  external_id        text,
  sync_state         sync_state not null default 'not_synced',
  sync_enabled       boolean not null default true,
  last_synced_at     timestamptz,
  source_hash        text,
  locked_fields      text[] not null default '{}',

  sold_at            timestamptz,
  created_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint vehicles_year_check check (year between 1900 and 2100),
  constraint vehicles_partner_requires_lot check (
    source <> 'partner' or partner_lot_id is not null
  ),
  constraint vehicles_feed_requires_external_id check (
    feed_id is null or external_id is not null
  )
);

-- A VIN may legitimately repeat across partner feeds mid-transfer, so it is
-- indexed but not globally unique. Identity within a feed is (feed, external id).
create unique index vehicles_feed_external_idx
  on public.vehicles (feed_id, external_id)
  where feed_id is not null;

create index vehicles_vin_idx        on public.vehicles (vin) where vin is not null;
create index vehicles_status_idx     on public.vehicles (status);
create index vehicles_featured_idx   on public.vehicles (is_featured) where status = 'available';
create index vehicles_make_model_idx on public.vehicles (make, model);
create index vehicles_price_idx      on public.vehicles (price);
create index vehicles_partner_idx    on public.vehicles (partner_lot_id);
create index vehicles_source_idx     on public.vehicles (source, ingestion_method);

-- ---------------------------------------------------------------------
-- vehicle_photos — files live in the `vehicle-photos` bucket.
-- `remote_url` lets a feed reference a partner-hosted image before (or
-- instead of) mirroring it into storage.
-- ---------------------------------------------------------------------
create table public.vehicle_photos (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references public.vehicles (id) on delete cascade,
  storage_path  text,
  remote_url    text,
  alt_text      text,
  position      smallint not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint vehicle_photos_needs_location check (
    storage_path is not null or remote_url is not null
  )
);

create index vehicle_photos_vehicle_idx on public.vehicle_photos (vehicle_id, position);
create unique index vehicle_photos_one_primary
  on public.vehicle_photos (vehicle_id) where is_primary;

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table public.customers (
  id             uuid primary key default gen_random_uuid(),
  first_name     text not null,
  last_name      text not null,
  email          text,
  phone          text,
  address_line1  text,
  address_line2  text,
  city           text,
  state          text,
  postal_code    text,
  preferred_contact contact_method not null default 'any',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index customers_email_idx on public.customers (lower(email));
create index customers_phone_idx on public.customers (phone);

-- ---------------------------------------------------------------------
-- leads — every inbound contact, from any form
-- ---------------------------------------------------------------------
create table public.leads (
  id           uuid primary key default gen_random_uuid(),
  first_name   text,
  last_name    text,
  email        text,
  phone        text,
  message      text,
  preferred_contact contact_method not null default 'any',

  source       lead_source not null default 'homepage_form',
  status       lead_status not null default 'new',

  vehicle_id   uuid references public.vehicles (id) on delete set null,
  customer_id  uuid references public.customers (id) on delete set null,
  assigned_to  uuid references public.profiles (id) on delete set null,

  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,

  contacted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint leads_needs_contact check (email is not null or phone is not null)
);

create index leads_status_idx     on public.leads (status, created_at desc);
create index leads_assigned_idx   on public.leads (assigned_to);
create index leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------
-- prequalifications — REPLACES the earlier credit_applications table.
--
-- Deliberately holds no regulated financial identifiers. Income and down
-- payment are banded enums, employment is a status, and there is no DOB,
-- SSN, licence number or account data. This is a sales-qualification
-- record, not a credit application.
-- ---------------------------------------------------------------------
create table public.prequalifications (
  id                    uuid primary key default gen_random_uuid(),
  lead_id               uuid references public.leads (id) on delete set null,
  customer_id           uuid references public.customers (id) on delete set null,
  vehicle_id            uuid references public.vehicles (id) on delete set null,

  first_name            text not null,
  last_name             text not null,
  email                 text,
  phone                 text not null,
  preferred_contact     contact_method not null default 'any',

  employment            employment_status not null default 'prefer_not_to_say',
  employer_name         text,
  monthly_income_band   income_range not null default 'prefer_not_to_say',
  down_payment_band     down_payment_range not null default 'undecided',

  preferred_vehicle_type text,
  has_trade_in          boolean not null default false,
  timeframe             text,
  notes                 text,

  -- Consent evidence for outbound contact (TCPA). IP and user agent are
  -- kept only as proof of consent and should be purged on the retention
  -- schedule in docs/architecture-forms.md.
  consent_contact       boolean not null default false,
  consent_text_version  text,
  consented_at          timestamptz,
  consent_ip            inet,
  consent_user_agent    text,

  status                prequal_status not null default 'new',
  assigned_to           uuid references public.profiles (id) on delete set null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index prequalifications_status_idx on public.prequalifications (status, created_at desc);
create index prequalifications_lead_idx   on public.prequalifications (lead_id);

-- ---------------------------------------------------------------------
-- lender_applications — forward-compatibility POINTER ONLY.
--
-- When a lender / application provider is chosen, the regulated
-- application lives in THEIR system. This table records that it exists and
-- where, so the CRM can show status without ever holding the sensitive
-- payload. No applicant fields belong here.
-- ---------------------------------------------------------------------
create table public.lender_applications (
  id                  uuid primary key default gen_random_uuid(),
  prequalification_id uuid references public.prequalifications (id) on delete set null,
  lead_id             uuid references public.leads (id) on delete set null,
  customer_id         uuid references public.customers (id) on delete set null,
  vehicle_id          uuid references public.vehicles (id) on delete set null,

  provider            text not null,
  external_id         text not null,
  external_url        text,
  status              text not null default 'submitted',
  decision            text,
  decided_at          timestamptz,
  submitted_by        uuid references public.profiles (id) on delete set null,
  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index lender_applications_provider_external_idx
  on public.lender_applications (provider, external_id);

-- ---------------------------------------------------------------------
-- trade_ins
-- ---------------------------------------------------------------------
create table public.trade_ins (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid references public.leads (id) on delete set null,
  customer_id          uuid references public.customers (id) on delete set null,

  first_name           text,
  last_name            text,
  email                text,
  phone                text,

  vin                  text,
  year                 smallint,
  make                 text,
  model                text,
  trim                 text,
  mileage              integer,
  condition            text,
  has_accidents        boolean,
  still_financed       boolean,
  notes                text,

  estimated_value_low  numeric(10, 2),
  estimated_value_high numeric(10, 2),
  offer_amount         numeric(10, 2),
  offer_expires_at     timestamptz,

  status               trade_in_status not null default 'submitted',
  assigned_to          uuid references public.profiles (id) on delete set null,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index trade_ins_status_idx on public.trade_ins (status, created_at desc);

create table public.trade_in_photos (
  id            uuid primary key default gen_random_uuid(),
  trade_in_id   uuid not null references public.trade_ins (id) on delete cascade,
  storage_path  text not null,
  position      smallint not null default 0,
  created_at    timestamptz not null default now()
);

create index trade_in_photos_trade_in_idx on public.trade_in_photos (trade_in_id, position);

-- ---------------------------------------------------------------------
-- deals — the /admin/pipeline board
-- ---------------------------------------------------------------------
create table public.deals (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid references public.leads (id) on delete set null,
  customer_id          uuid references public.customers (id) on delete set null,
  vehicle_id           uuid references public.vehicles (id) on delete set null,
  prequalification_id  uuid references public.prequalifications (id) on delete set null,
  lender_application_id uuid references public.lender_applications (id) on delete set null,
  trade_in_id          uuid references public.trade_ins (id) on delete set null,

  stage                deal_stage not null default 'new',
  sale_price           numeric(10, 2),
  gross_profit         numeric(10, 2),
  assigned_to          uuid references public.profiles (id) on delete set null,
  expected_close       date,
  closed_at            timestamptz,
  lost_reason          text,
  notes                text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index deals_stage_idx    on public.deals (stage, updated_at desc);
create index deals_assigned_idx on public.deals (assigned_to);

-- ---------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------
create table public.appointments (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references public.customers (id) on delete set null,
  lead_id      uuid references public.leads (id) on delete set null,
  vehicle_id   uuid references public.vehicles (id) on delete set null,
  type         appointment_type not null default 'test_drive',
  status       appointment_status not null default 'scheduled',
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location     text,
  assigned_to  uuid references public.profiles (id) on delete set null,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint appointments_time_order check (ends_at is null or ends_at > starts_at)
);

create index appointments_starts_at_idx on public.appointments (starts_at);
create index appointments_status_idx    on public.appointments (status, starts_at);

-- ---------------------------------------------------------------------
-- messages — unified inbox
-- ---------------------------------------------------------------------
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references public.leads (id) on delete cascade,
  customer_id  uuid references public.customers (id) on delete cascade,
  channel      message_channel not null default 'web_form',
  direction    message_direction not null,
  subject      text,
  body         text not null,
  author_id    uuid references public.profiles (id) on delete set null,
  sent_at      timestamptz not null default now(),
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint messages_needs_thread check (lead_id is not null or customer_id is not null)
);

create index messages_lead_idx     on public.messages (lead_id, sent_at desc);
create index messages_customer_idx on public.messages (customer_id, sent_at desc);
create index messages_unread_idx   on public.messages (read_at) where read_at is null;

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  author_email  text,
  rating        smallint not null,
  body          text not null,
  vehicle_id    uuid references public.vehicles (id) on delete set null,
  source        text not null default 'website',
  status        review_status not null default 'pending',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1 and 5)
);

create index reviews_published_idx on public.reviews (status, published_at desc);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'partner_lots', 'inventory_feeds', 'vehicles', 'customers',
    'leads', 'prequalifications', 'lender_applications', 'trade_ins',
    'deals', 'appointments', 'reviews'
  ]
  loop
    execute format(
      'create trigger set_updated_at_%1$s
         before update on public.%1$I
         for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;
