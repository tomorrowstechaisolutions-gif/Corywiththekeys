-- =====================================================================
-- The Key Konnect — function hardening
-- 0007_harden_functions.sql
--
-- Raised by the Supabase database linter after 0006. Two classes of issue,
-- neither visible on a vanilla PostgreSQL instance:
--
-- 1. `anon` and `authenticated` could call every SECURITY DEFINER function
--    over PostgREST at /rest/v1/rpc/<name>. Supabase's own default
--    privileges GRANT EXECUTE on new functions to those roles, so the
--    `revoke ... from public` in 0002 and 0004 was not enough — the
--    explicit role grants survived it. Most seriously, the rate limiter
--    and the feed importer were both reachable with the anon key.
--
-- 2. Functions without a fixed `search_path` can be hijacked by a caller
--    who puts a malicious schema earlier on the path.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Pin search_path on every remaining function
-- ---------------------------------------------------------------------
alter function public.set_updated_at()                          set search_path = public;
alter function public.syncable_vehicle_columns()                set search_path = public;
alter function public.build_vehicle_slug(integer, text, text, text) set search_path = public;
alter function public.vehicles_apply_overrides()                set search_path = public;
alter function public.unlock_vehicle_fields(uuid, text[])       set search_path = public;

-- ---------------------------------------------------------------------
-- 2. Close the RPC surface.
--
-- Trigger functions need no EXECUTE grant at fire time — PostgreSQL checks
-- that permission when the trigger is created — so they can be revoked
-- from everyone.
-- ---------------------------------------------------------------------
revoke execute on function public.handle_new_user()             from public, anon, authenticated;
revoke execute on function public.write_audit_log()             from public, anon, authenticated;
revoke execute on function public.vehicles_apply_overrides()    from public, anon, authenticated;
revoke execute on function public.set_updated_at()              from public, anon, authenticated;

-- Service-role only: abuse control and the feed importer.
revoke execute on function public.check_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.prune_rate_limits(interval)
  from public, anon, authenticated;
revoke execute on function public.feed_upsert_vehicle(uuid, text, jsonb, uuid)
  from public, anon, authenticated;
revoke execute on function public.feed_archive_missing(uuid, text[])
  from public, anon, authenticated;

grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.prune_rate_limits(interval)                    to service_role;
grant execute on function public.feed_upsert_vehicle(uuid, text, jsonb, uuid)   to service_role;
grant execute on function public.feed_archive_missing(uuid, text[])             to service_role;

-- Role helpers: `authenticated` must keep EXECUTE because RLS policies
-- evaluate them as the querying role. `anon` never needs them — no anon
-- policy references a helper.
revoke execute on function public.is_staff()          from public, anon;
revoke execute on function public.is_admin()          from public, anon;
revoke execute on function public.can_write()         from public, anon;
revoke execute on function public.current_user_role() from public, anon;

grant execute on function public.is_staff()          to authenticated, service_role;
grant execute on function public.is_admin()          to authenticated, service_role;
grant execute on function public.can_write()         to authenticated, service_role;
grant execute on function public.current_user_role() to authenticated, service_role;

-- Staff unlock an override from the admin console.
revoke execute on function public.unlock_vehicle_fields(uuid, text[]) from public, anon;
grant  execute on function public.unlock_vehicle_fields(uuid, text[]) to authenticated, service_role;

-- Read-only helpers, harmless but no reason to expose.
revoke execute on function public.syncable_vehicle_columns() from public, anon;
revoke execute on function public.build_vehicle_slug(integer, text, text, text) from public, anon;
grant  execute on function public.syncable_vehicle_columns() to authenticated, service_role;
grant  execute on function public.build_vehicle_slug(integer, text, text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 3. Future functions must not inherit the broad default either.
-- ---------------------------------------------------------------------
alter default privileges in schema public
  revoke all on functions from anon, authenticated;

alter default privileges in schema public
  grant all on functions to service_role;

-- NOTE: `public.rate_limits` intentionally has RLS enabled and NO policy.
-- That is deny-by-default for anon and authenticated; only the service
-- role, which bypasses RLS, touches it. The linter reports this as INFO.
