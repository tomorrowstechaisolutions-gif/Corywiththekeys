-- =====================================================================
-- The Key Konnect — inventory synchronisation layer
-- 0002_inventory_sync.sql
--
-- Everything here is inert until a feed is switched on. Manual entry in
-- the admin works exactly the same whether or not any of this is used.
-- Adding CSV / XML / API partner feeds later requires NO change to
-- `vehicles` or `vehicle_photos` — only rows in these tables.
-- =====================================================================

-- ---------------------------------------------------------------------
-- inventory_sync_runs — one row per feed execution, for the run history
-- shown in /admin/partner-lots and /admin/inventory
-- ---------------------------------------------------------------------
create table public.inventory_sync_runs (
  id                uuid primary key default gen_random_uuid(),
  feed_id           uuid not null references public.inventory_feeds (id) on delete cascade,
  status            feed_run_status not null default 'running',
  started_at        timestamptz not null default now(),
  finished_at       timestamptz,
  rows_received     integer not null default 0,
  vehicles_created  integer not null default 0,
  vehicles_updated  integer not null default 0,
  vehicles_archived integer not null default 0,
  rows_skipped      integer not null default 0,
  error_message     text,
  details           jsonb not null default '{}'::jsonb,
  triggered_by      uuid references public.profiles (id) on delete set null
);

create index inventory_sync_runs_feed_idx on public.inventory_sync_runs (feed_id, started_at desc);

-- ---------------------------------------------------------------------
-- inventory_staging — raw rows exactly as the partner sent them.
--
-- Import is two-phase: land raw, then map. That means a bad mapping never
-- corrupts live inventory, and a feed can be replayed after fixing the
-- mapping without re-fetching from the partner.
-- ---------------------------------------------------------------------
create table public.inventory_staging (
  id            uuid primary key default gen_random_uuid(),
  feed_id       uuid not null references public.inventory_feeds (id) on delete cascade,
  run_id        uuid references public.inventory_sync_runs (id) on delete set null,
  external_id   text not null,
  raw           jsonb not null,
  row_hash      text not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  vehicle_id    uuid references public.vehicles (id) on delete set null,
  error_message text
);

create index inventory_staging_feed_idx      on public.inventory_staging (feed_id, external_id);
create index inventory_staging_unprocessed_idx on public.inventory_staging (processed_at)
  where processed_at is null;

-- ---------------------------------------------------------------------
-- Manual override protection
--
-- `vehicles.locked_fields` lists columns a human has edited. A feed import
-- sets `app.is_feed_sync = 'on'` for its transaction; while that flag is
-- set, the trigger below restores any locked column to its stored value.
-- Staff edits (flag off) write normally and add the touched columns to
-- `locked_fields` automatically.
--
-- Clearing an override is an explicit act: unlock_vehicle_fields().
-- ---------------------------------------------------------------------

-- Columns a feed is ever allowed to write.
create or replace function public.syncable_vehicle_columns()
returns text[]
language sql
immutable
as $$
  select array[
    'vin', 'stock_number', 'year', 'make', 'model', 'trim', 'body_type',
    'mileage', 'exterior_color', 'interior_color', 'transmission',
    'drivetrain', 'fuel_type', 'engine', 'price', 'monthly_payment',
    'down_payment', 'description', 'features', 'status'
  ]::text[]
$$;

create or replace function public.vehicles_apply_overrides()
returns trigger
language plpgsql
as $$
declare
  is_sync   boolean := coalesce(current_setting('app.is_feed_sync', true), 'off') = 'on';
  col       text;
  old_json  jsonb := to_jsonb(old);
  new_json  jsonb := to_jsonb(new);
  changed   text[] := '{}';
begin
  if is_sync then
    -- A sync may not touch anything a human has locked.
    foreach col in array old.locked_fields loop
      new_json := jsonb_set(new_json, array[col], old_json -> col, true);
    end loop;

    -- A sync may never change override bookkeeping or curation flags.
    new_json := jsonb_set(new_json, '{locked_fields}', old_json -> 'locked_fields', true);
    new_json := jsonb_set(new_json, '{is_featured}',   old_json -> 'is_featured', true);
    new_json := jsonb_set(new_json, '{slug}',          old_json -> 'slug', true);

    new := jsonb_populate_record(new, new_json);
    return new;
  end if;

  -- Manual edit: remember which syncable columns the human changed.
  -- If the statement set `locked_fields` itself (an explicit lock/unlock),
  -- that wins and no auto-locking happens.
  if new.locked_fields is not distinct from old.locked_fields then
    foreach col in array public.syncable_vehicle_columns() loop
      if (old_json -> col) is distinct from (new_json -> col) then
        changed := changed || col;
      end if;
    end loop;

    if array_length(changed, 1) is not null then
      new.locked_fields := array(
        select distinct unnest(coalesce(old.locked_fields, '{}') || changed)
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger vehicles_apply_overrides
  before update on public.vehicles
  for each row execute function public.vehicles_apply_overrides();

-- Explicitly hand a field back to the feed.
create or replace function public.unlock_vehicle_fields(
  p_vehicle_id uuid,
  p_fields text[]
)
returns text[]
language plpgsql
security invoker
as $$
declare
  remaining text[];
begin
  update public.vehicles
     set locked_fields = array(
           select unnest(locked_fields) except select unnest(p_fields)
         )
   where id = p_vehicle_id
  returning locked_fields into remaining;

  return remaining;
end;
$$;

-- ---------------------------------------------------------------------
-- Convenience view: what the public site shows
-- ---------------------------------------------------------------------
create view public.published_vehicles
with (security_invoker = true)
as
  select v.*, p.name as partner_lot_name, p.slug as partner_lot_slug
    from public.vehicles v
    left join public.partner_lots p on p.id = v.partner_lot_id
   where v.status in ('available', 'pending');

-- ---------------------------------------------------------------------
-- Feed importer entry points.
--
-- A JS importer using supabase-js has no transaction control, so it cannot
-- set `app.is_feed_sync` itself. These SECURITY DEFINER functions set the
-- flag for their own statement and do the write, which means the override
-- guard above is impossible to bypass accidentally — an importer that
-- writes to `vehicles` directly simply gets treated as a manual edit and
-- locks the columns it touched.
--
-- `p_data` is filtered to syncable_vehicle_columns() before it is applied,
-- so a partner feed can never set status flags, curation fields or
-- ownership columns it has no business setting.
-- ---------------------------------------------------------------------
-- Slug helper — stable, collision-safe.
create or replace function public.build_vehicle_slug(
  p_year integer, p_make text, p_model text, p_suffix text
)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(concat_ws('-', nullif(p_year, 0)::text, p_make, p_model, p_suffix)),
    '[^a-z0-9]+', '-', 'g'
  ))
$$;

create or replace function public.feed_upsert_vehicle(
  p_feed_id      uuid,
  p_external_id  text,
  p_data         jsonb,
  p_run_id       uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id       uuid;
  v_lot      uuid;
  v_method   ingestion_method;
  v_allowed  jsonb := '{}'::jsonb;
  v_cols     text := '';
  v_col      text;
  v_slug     text;
  v_hash     text := md5(p_data::text);
begin
  perform set_config('app.is_feed_sync', 'on', true);

  select f.partner_lot_id,
         case f.type
           when 'csv'           then 'csv_import'
           when 'xml'           then 'xml_feed'
           when 'json_api'      then 'json_api'
           when 'partner_api'   then 'partner_api'
           else 'csv_import'
         end::ingestion_method
    into v_lot, v_method
    from public.inventory_feeds f
   where f.id = p_feed_id;

  if not found then
    raise exception 'unknown feed %', p_feed_id;
  end if;

  -- whitelist the payload
  foreach v_col in array public.syncable_vehicle_columns() loop
    if p_data ? v_col then
      v_allowed := v_allowed || jsonb_build_object(v_col, p_data -> v_col);
      v_cols := v_cols || case when v_cols = '' then '' else ', ' end || quote_ident(v_col);
    end if;
  end loop;

  select id into v_id
    from public.vehicles
   where feed_id = p_feed_id and external_id = p_external_id;

  if v_id is null then
    v_slug := public.build_vehicle_slug(
      coalesce((p_data ->> 'year')::integer, 0),
      coalesce(p_data ->> 'make', 'vehicle'),
      coalesce(p_data ->> 'model', ''),
      p_external_id
    );

    insert into public.vehicles (
      slug, year, make, model, status, source, partner_lot_id,
      ingestion_method, feed_id, external_id, sync_state, last_synced_at, source_hash
    )
    values (
      v_slug,
      coalesce((p_data ->> 'year')::smallint, 1900),
      coalesce(p_data ->> 'make', 'Unknown'),
      coalesce(p_data ->> 'model', 'Unknown'),
      'draft',
      (case when v_lot is null then 'owned' else 'partner' end)::vehicle_source,
      v_lot,
      v_method,
      p_feed_id,
      p_external_id,
      'synced',
      now(),
      v_hash
    )
    returning id into v_id;
  end if;

  if v_cols <> '' then
    execute format(
      'update public.vehicles set (%1$s) = (select %1$s from jsonb_populate_record(null::public.vehicles, $1)) where id = $2',
      v_cols
    ) using v_allowed, v_id;
  end if;

  update public.vehicles
     set sync_state = 'synced', last_synced_at = now(), source_hash = v_hash
   where id = v_id;

  if p_run_id is not null then
    update public.inventory_staging
       set processed_at = now(), vehicle_id = v_id
     where run_id = p_run_id and external_id = p_external_id;
  end if;

  return v_id;
end;
$$;

-- Units the feed stopped sending. Archives rather than deletes, so history,
-- deals and audit trail survive.
create or replace function public.feed_archive_missing(
  p_feed_id uuid,
  p_seen_external_ids text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  perform set_config('app.is_feed_sync', 'on', true);

  update public.vehicles
     set status = 'archived', sync_state = 'orphaned'
   where feed_id = p_feed_id
     and sync_enabled
     and status <> 'archived'
     and not (external_id = any (p_seen_external_ids));

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default, and revoking from `anon`
-- alone leaves that grant in place. Revoke from PUBLIC, then grant back
-- only to the service role the importer runs as.
revoke execute on function public.feed_upsert_vehicle(uuid, text, jsonb, uuid) from public;
revoke execute on function public.feed_archive_missing(uuid, text[]) from public;
revoke execute on function public.unlock_vehicle_fields(uuid, text[]) from public;

grant execute on function public.feed_upsert_vehicle(uuid, text, jsonb, uuid) to service_role;
grant execute on function public.feed_archive_missing(uuid, text[]) to service_role;
grant execute on function public.unlock_vehicle_fields(uuid, text[]) to authenticated, service_role;
