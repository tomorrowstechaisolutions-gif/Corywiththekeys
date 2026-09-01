-- =====================================================================
-- The Key Konnect — new accounts start inactive
-- 0009_secure_new_users.sql
--
-- THE PROBLEM THIS FIXES
--
-- `is_staff()` returns true for any profile row with is_active = true, and
-- `handle_new_user()` created every new profile active by default. Supabase
-- Auth accepts sign-ups with the anon key, so anyone who found the project
-- URL could register and immediately hold staff read access to leads,
-- prequalifications, customers and messages — every table of personal data
-- in the CRM.
--
-- New profiles are now created INACTIVE. An existing admin must activate
-- the account and assign a role before it can see anything. RLS already
-- denies inactive profiles, so this closes the hole at the source.
--
-- Also turn off public sign-ups in the Supabase dashboard:
--   Authentication -> Sign In / Providers -> Email -> Allow new users to sign up = OFF
-- This migration is the belt; that setting is the braces.
-- =====================================================================

alter table public.profiles alter column is_active set default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- is_active is deliberately false: a new sign-up is a request for
  -- access, not a grant of it. An admin activates and assigns the role.
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'viewer',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

comment on column public.profiles.is_active is
  'Gates all staff access. New sign-ups start false and must be activated by an admin.';
