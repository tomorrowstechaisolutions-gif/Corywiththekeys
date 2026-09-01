-- =====================================================================
-- The Key Konnect — abuse control, submission logging, audit trail
-- 0003_security.sql
--
-- All public writes go Browser -> Server Action -> Supabase. These tables
-- are the server-side half of that pipeline. Nothing here is reachable
-- with the anon key.
-- =====================================================================

create type submission_outcome as enum (
  'accepted',
  'rejected_validation',
  'rejected_rate_limit',
  'rejected_bot',
  'rejected_duplicate',
  'error'
);

create type audit_action as enum ('insert', 'update', 'delete');

-- ---------------------------------------------------------------------
-- rate_limits — fixed-window counters, atomic, no external service.
--
-- One row per (bucket, identifier, window). Swappable for Upstash/Redis
-- later by reimplementing check_rate_limit() on the app side; callers only
-- ever see the boolean.
-- ---------------------------------------------------------------------
create table public.rate_limits (
  bucket        text        not null,
  identifier    text        not null,
  window_start  timestamptz not null,
  hits          integer     not null default 0,
  primary key (bucket, identifier, window_start)
);

create index rate_limits_window_idx on public.rate_limits (window_start);

-- Returns true when the call is ALLOWED, false when the limit is exceeded.
create or replace function public.check_rate_limit(
  p_bucket          text,
  p_identifier      text,
  p_limit           integer,
  p_window_seconds  integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (bucket, identifier, window_start, hits)
  values (p_bucket, p_identifier, v_window, 1)
  on conflict (bucket, identifier, window_start)
    do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

-- Housekeeping — call from a scheduled job or the nightly cron.
create or replace function public.prune_rate_limits(p_older_than interval default '1 day')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limits where window_start < now() - p_older_than;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ---------------------------------------------------------------------
-- form_submissions — one row per public form POST, accepted or not.
--
-- This is the abuse/observability log, deliberately separate from the
-- business records. IP is stored HASHED here; the only place a raw IP is
-- retained is prequalifications.consent_ip, as consent evidence.
-- ---------------------------------------------------------------------
create table public.form_submissions (
  id                 uuid primary key default gen_random_uuid(),
  form_key           text not null,
  outcome            submission_outcome not null,

  ip_hash            text,
  user_agent         text,
  country            text,
  referrer           text,

  bot_provider       text,
  bot_check_passed   boolean,
  bot_score          numeric(4, 3),
  honeypot_tripped   boolean not null default false,
  time_to_submit_ms  integer,
  spam_signals       text[] not null default '{}',

  field_errors       jsonb,
  error_code         text,

  related_table      text,
  related_id         uuid,

  created_at         timestamptz not null default now()
);

create index form_submissions_form_idx    on public.form_submissions (form_key, created_at desc);
create index form_submissions_outcome_idx on public.form_submissions (outcome, created_at desc);
create index form_submissions_ip_idx      on public.form_submissions (ip_hash, created_at desc);

-- ---------------------------------------------------------------------
-- audit_log — who changed what in the admin.
--
-- Attached with 'full' to operational tables and 'fields_only' to tables
-- holding personal data, so the audit trail records THAT a field changed
-- without duplicating the personal data into a second table.
-- ---------------------------------------------------------------------
create table public.audit_log (
  id             bigint generated always as identity primary key,
  table_name     text not null,
  record_id      uuid,
  action         audit_action not null,
  actor_id       uuid references public.profiles (id) on delete set null,
  changed_fields text[] not null default '{}',
  old_values     jsonb,
  new_values     jsonb,
  created_at     timestamptz not null default now()
);

create index audit_log_table_record_idx on public.audit_log (table_name, record_id, created_at desc);
create index audit_log_actor_idx        on public.audit_log (actor_id, created_at desc);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode     text := coalesce(tg_argv[0], 'full');
  v_old      jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_new      jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_changed  text[] := '{}';
  v_key      text;
  v_id       uuid;
begin
  if tg_op = 'UPDATE' then
    for v_key in select jsonb_object_keys(v_new) loop
      if (v_old -> v_key) is distinct from (v_new -> v_key) then
        v_changed := v_changed || v_key;
      end if;
    end loop;

    if array_length(v_changed, 1) is null then
      return null;
    end if;
  end if;

  v_id := coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid);

  insert into public.audit_log (
    table_name, record_id, action, actor_id, changed_fields, old_values, new_values
  )
  values (
    tg_table_name,
    v_id,
    lower(tg_op)::audit_action,
    auth.uid(),
    v_changed,
    case when v_mode = 'full' then v_old else null end,
    case when v_mode = 'full' then v_new else null end
  );

  return null;
end;
$$;

-- Full before/after snapshots — no personal data in these tables.
do $$
declare t text;
begin
  foreach t in array array['vehicles', 'partner_lots', 'inventory_feeds', 'profiles', 'deals']
  loop
    execute format(
      'create trigger audit_%1$s after insert or update or delete on public.%1$I
         for each row execute function public.write_audit_log(''full'');',
      t
    );
  end loop;
end;
$$;

-- Field names only — these hold personal data.
do $$
declare t text;
begin
  foreach t in array array[
    'leads', 'prequalifications', 'lender_applications',
    'trade_ins', 'customers', 'appointments'
  ]
  loop
    execute format(
      'create trigger audit_%1$s after insert or update or delete on public.%1$I
         for each row execute function public.write_audit_log(''fields_only'');',
      t
    );
  end loop;
end;
$$;
