-- =====================================================================
-- The Key Konnect — vehicle intake from a phone
-- 0025_mobile_vehicle_intake.sql
--
-- Someone on the lot scans a QR in the admin, scans the VIN, shoots
-- photos, and submits. Nothing they capture goes live: the record parks
-- in a review queue until an admin or Cory approves it.
--
-- The intake lives on `vehicles` rather than a staging table on purpose.
-- A staging table means two shapes of the same thing and a copy step that
-- can half-fail; a draft vehicle carrying a review state is one record
-- from first scan to published listing, and the existing edit screen,
-- photo manager and validation all work on it unchanged.
-- =====================================================================

alter type ingestion_method add value if not exists 'mobile_intake';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'intake_status') then
    create type intake_status as enum (
      'in_progress',  -- being captured on the phone right now
      'pending',      -- submitted, waiting on a reviewer
      'approved',     -- a reviewer accepted it
      'returned'      -- sent back with a note; needs another look
    );
  end if;
end $$;

alter table public.vehicles
  add column if not exists intake_status intake_status,
  add column if not exists intake_note   text,
  add column if not exists intake_by     uuid references public.profiles (id) on delete set null,
  add column if not exists intake_at     timestamptz;

comment on column public.vehicles.intake_status is
  'Null for vehicles typed in or imported. Set only by the phone intake flow.';
comment on column public.vehicles.intake_note is
  'The reviewer''s note when a submission is sent back.';
comment on column public.vehicles.intake_at is
  'When it was submitted for review — not when capture started.';

-- The review queue reads this constantly and it is a tiny slice of the
-- table, so keep the index partial.
create index if not exists vehicles_intake_queue_idx
  on public.vehicles (intake_status, intake_at desc)
  where intake_status is not null;
