-- =====================================================================
-- The Key Konnect — explicit table privileges
-- 0006_grants.sql
--
-- Supabase's default privileges grant broad access on new public tables to
-- anon and authenticated, leaving RLS as the only gate. Defence in depth:
-- strip that back and grant exactly what each role needs, so a policy
-- mistake alone cannot expose a table.
-- =====================================================================

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- ---------------------------------------------------------------------
-- anon: read-only, and only the public catalogue
-- ---------------------------------------------------------------------
grant select on public.vehicles         to anon;
grant select on public.vehicle_photos   to anon;
grant select on public.reviews          to anon;
grant select on public.partner_lots     to anon;
grant select on public.published_vehicles to anon;

-- The view is security_invoker, so anon needs a row policy on partner_lots
-- for the join to resolve. Only lots explicitly flagged for display.
create policy "partner_lots: public read displayed"
  on public.partner_lots for select
  to anon, authenticated
  using (is_active and display_on_site);

-- ---------------------------------------------------------------------
-- authenticated: console tables. RLS still decides viewer vs sales vs admin.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'partner_lots', 'inventory_feeds', 'vehicles', 'vehicle_photos',
    'inventory_sync_runs', 'inventory_staging', 'customers', 'leads',
    'prequalifications', 'lender_applications', 'trade_ins', 'trade_in_photos',
    'deals', 'appointments', 'messages', 'reviews'
  ]
  loop
    execute format(
      'grant select, insert, update, delete on public.%1$I to authenticated;', t
    );
  end loop;
end;
$$;

grant select on public.published_vehicles to authenticated;

-- Admin-only reads. RLS narrows these to role = 'admin'.
grant select on public.form_submissions to authenticated;
grant select on public.audit_log        to authenticated;

-- rate_limits gets nothing: service role only.

-- ---------------------------------------------------------------------
-- service_role: full access. Server Actions and the feed importer run as
-- this role, and it has BYPASSRLS, so table privileges must be explicit
-- rather than inherited from Supabase defaults we just stripped.
-- ---------------------------------------------------------------------
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines  in schema public to service_role;
grant usage on schema public to service_role;

-- ---------------------------------------------------------------------
-- Future tables should not silently inherit broad access either.
-- ---------------------------------------------------------------------
alter default privileges in schema public
  revoke all on tables from anon, authenticated;

alter default privileges in schema public
  grant all on tables to service_role;
