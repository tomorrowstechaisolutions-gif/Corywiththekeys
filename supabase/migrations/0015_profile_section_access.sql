-- Per-person access to admin sections.
--
-- The role still says what someone may DO — admin manages people, sales may
-- write, viewer is read-only. This says which parts of the console they SEE,
-- so a lot porter can be given Inventory and nothing else without inventing a
-- new role for every combination the business turns out to need.
--
-- NULL means "no per-person restriction": that person gets whatever their role
-- allows. That is deliberately different from an empty array, which means "no
-- sections at all". Existing rows stay NULL, so nobody's access changes when
-- this ships, and an admin has to opt in to restricting someone.

alter table public.profiles
  add column sections text[];

comment on column public.profiles.sections is
  'Admin section keys this person may open. NULL = no restriction (role default). Empty array = no sections. Enforced in the app by requireSection(); the role still governs RLS.';

-- Admins are never section-restricted. Letting one lock themselves out of
-- /admin/team is how a business ends up with no way back in.
create or replace function public.profiles_admin_has_all_sections()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role = 'admin' then
    new.sections := null;
  end if;
  return new;
end;
$$;

create trigger profiles_admin_sections
  before insert or update on public.profiles
  for each row execute function public.profiles_admin_has_all_sections();
