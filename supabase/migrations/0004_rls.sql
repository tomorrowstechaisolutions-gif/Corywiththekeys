-- =====================================================================
-- The Key Konnect — Row Level Security
-- 0004_rls.sql
--
-- Model
--   anon   : READ ONLY, and only published inventory + published reviews.
--            No INSERT policy exists anywhere. Every public write goes
--            through a Server Action on the service-role key, which
--            bypasses RLS by design after server-side validation.
--   viewer : reads the console, writes nothing
--   sales  : reads + writes operational records; cannot manage staff
--   admin  : everything
--
-- RLS is enabled on every table. A table with no matching policy is
-- therefore closed to anon and to authenticated non-staff — deny by default.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Role helpers. SECURITY DEFINER so policies don't recurse through
-- profiles' own RLS.
-- ---------------------------------------------------------------------
create or replace function public.current_user_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select p.role from public.profiles p
   where p.id = auth.uid() and p.is_active
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.is_active
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.is_active and p.role = 'admin'
  )
$$;

-- "may change operational data" — sales or admin
create or replace function public.can_write()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.is_active and p.role in ('admin', 'sales')
  )
$$;

-- Abuse-control functions are service-role only. EXECUTE is granted to
-- PUBLIC by default, so it must be revoked from PUBLIC — revoking from
-- `anon` alone leaves the default grant intact.
revoke execute on function public.check_rate_limit(text, text, integer, integer) from public;
revoke execute on function public.prune_rate_limits(interval) from public;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.prune_rate_limits(interval) to service_role;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'partner_lots', 'inventory_feeds', 'vehicles', 'vehicle_photos',
    'inventory_sync_runs', 'inventory_staging', 'customers', 'leads',
    'prequalifications', 'lender_applications', 'trade_ins', 'trade_in_photos',
    'deals', 'appointments', 'messages', 'reviews',
    'rate_limits', 'form_submissions', 'audit_log'
  ]
  loop
    execute format('alter table public.%1$I enable row level security;', t);
    execute format('alter table public.%1$I force row level security;', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "profiles: staff read"
  on public.profiles for select
  using (public.is_staff());

create policy "profiles: self update"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.current_user_role()
    and is_active
  );

create policy "profiles: admin manage"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Public READ surface — the only three things anon can see
-- ---------------------------------------------------------------------
create policy "vehicles: public read published"
  on public.vehicles for select
  to anon, authenticated
  using (status in ('available', 'pending'));

create policy "vehicle_photos: public read published"
  on public.vehicle_photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.vehicles v
       where v.id = vehicle_id and v.status in ('available', 'pending')
    )
  );

create policy "reviews: public read published"
  on public.reviews for select
  to anon, authenticated
  using (status = 'published');

-- ---------------------------------------------------------------------
-- Staff access
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  -- read for any active staff member, write for sales + admin
  foreach t in array array[
    'partner_lots', 'inventory_feeds', 'vehicles', 'vehicle_photos',
    'inventory_sync_runs', 'inventory_staging', 'customers', 'leads',
    'prequalifications', 'lender_applications', 'trade_ins',
    'trade_in_photos', 'deals', 'appointments', 'messages', 'reviews'
  ]
  loop
    execute format(
      'create policy "%1$s: staff read" on public.%1$I
         for select to authenticated using (public.is_staff());',
      t
    );
    execute format(
      'create policy "%1$s: staff write" on public.%1$I
         for all to authenticated
         using (public.can_write()) with check (public.can_write());',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin-only surfaces. rate_limits has no policy at all: service role only.
-- ---------------------------------------------------------------------
create policy "form_submissions: admin read"
  on public.form_submissions for select
  to authenticated
  using (public.is_admin());

create policy "audit_log: admin read"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());
