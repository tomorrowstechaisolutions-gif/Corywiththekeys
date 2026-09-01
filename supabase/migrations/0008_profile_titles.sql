-- =====================================================================
-- The Key Konnect — staff job titles + last-admin protection
-- 0008_profile_titles.sql
--
-- `role` is a PERMISSION LEVEL (admin / sales / viewer). `title` is what
-- the person is called on the org chart — "Head of IT Administrator",
-- "Owner", "Sales Consultant". They are deliberately separate: changing
-- someone's title must never change what they can do.
-- =====================================================================

alter table public.profiles add column title text;

comment on column public.profiles.role is
  'Permission level. Controls access via is_staff() / can_write() / is_admin().';
comment on column public.profiles.title is
  'Display job title only. Has no effect on permissions.';

-- ---------------------------------------------------------------------
-- Last-admin protection.
--
-- Without this, an admin can demote or deactivate themselves while being
-- the only admin, and the console becomes permanently unmanageable —
-- there would be no one left who can promote anyone. Locking yourself out
-- of your own CRM is a support call at best and a rebuild at worst.
-- ---------------------------------------------------------------------
create or replace function public.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other_admins integer;
begin
  if tg_op = 'DELETE' then
    if old.role = 'admin' and old.is_active then
      select count(*) into v_other_admins
        from public.profiles
       where role = 'admin' and is_active and id <> old.id;

      if v_other_admins = 0 then
        raise exception
          'Cannot remove the last active admin. Promote another admin first.'
          using errcode = 'check_violation';
      end if;
    end if;
    return old;
  end if;

  if old.role = 'admin'
     and old.is_active
     and (new.role <> 'admin' or new.is_active = false)
  then
    select count(*) into v_other_admins
      from public.profiles
     where role = 'admin' and is_active and id <> old.id;

    if v_other_admins = 0 then
      raise exception
        'Cannot demote or deactivate the last active admin. Promote another admin first.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_last_admin
  before update or delete on public.profiles
  for each row execute function public.protect_last_admin();

revoke execute on function public.protect_last_admin() from public, anon, authenticated;
