-- The owner role, and a photo on every profile.
--
-- 'owner' is Cory's seat. It reaches everything an admin reaches — the point
-- of the separate role is not extra power, it is that an admin cannot demote
-- or switch him off and lock the business owner out of his own console.

-- Every existing check for "admin" now means "admin or owner". Missing one of
-- these would leave the owner unable to open the console he owns.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.is_active and p.role in ('owner', 'admin')
  )
$$;

create or replace function public.can_write()
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.is_active
       and p.role in ('owner', 'admin', 'sales')
  )
$$;

-- Section restrictions are for staff. An owner or admin always has the lot.
create or replace function public.profiles_admin_has_all_sections()
returns trigger language plpgsql set search_path to ''
as $$
begin
  if new.role in ('owner', 'admin') then
    new.sections := null;
  end if;
  return new;
end;
$$;

-- "Last admin" now counts owners too: an owner is a way back in, so an admin
-- stepping down while an owner is active is fine, and vice versa.
create or replace function public.protect_last_admin()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
declare
  v_others integer;
begin
  if tg_op = 'DELETE' then
    if old.role in ('owner', 'admin') and old.is_active then
      select count(*) into v_others
        from public.profiles
       where role in ('owner', 'admin') and is_active and id <> old.id;

      if v_others = 0 then
        raise exception
          'Cannot remove the last active admin. Promote somebody else first.'
          using errcode = 'check_violation';
      end if;
    end if;
    return old;
  end if;

  if old.role in ('owner', 'admin')
     and old.is_active
     and (new.role not in ('owner', 'admin') or new.is_active = false)
  then
    select count(*) into v_others
      from public.profiles
     where role in ('owner', 'admin') and is_active and id <> old.id;

    if v_others = 0 then
      raise exception
        'Cannot demote or deactivate the last active admin. Promote somebody else first.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

/*
 * Only an owner appoints or removes an owner.
 *
 * An admin may still fix an owner's name, title, phone or photo — that is
 * ordinary housekeeping. What they cannot do is change the owner's role or
 * switch the owner off, which is the whole reason the role exists.
 *
 * NOTE: superseded by 0021, which adds the one-time bootstrap so the first
 * owner can be appointed by an admin. Kept here as the original step.
 */
create or replace function public.protect_owner_seat()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
declare
  v_actor public.user_role;
  v_touching_owner boolean;
begin
  v_touching_owner :=
       (old.role = 'owner' and (new.role <> 'owner'
                                or new.is_active is distinct from old.is_active))
    or (new.role = 'owner' and old.role <> 'owner');

  if not v_touching_owner then
    return new;
  end if;

  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  select role into v_actor from public.profiles where id = auth.uid();

  if v_actor is distinct from 'owner' then
    raise exception
      'Only the owner can appoint or remove an owner.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_owner_seat
  before update on public.profiles
  for each row execute function public.protect_owner_seat();

-- A photo, so the console stops being a list of names.
alter table public.profiles add column if not exists avatar_path text;

comment on column public.profiles.avatar_path is
  'Object path in the private staff-avatars bucket. Internal only: never rendered on the public website.';

/*
 * Private bucket, deliberately.
 *
 * Staff headshots are not marketing material. A public bucket would put every
 * employee's face on a guessable URL that works for anyone who finds it, which
 * is not what somebody agrees to when they upload a picture of themselves for
 * an internal tool. The console fetches short-lived signed URLs instead.
 */
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-avatars', 'staff-avatars', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Everyone signed in and active can see their colleagues' photos.
create policy "staff read avatars"
  on storage.objects for select
  using (bucket_id = 'staff-avatars' and public.is_staff());

-- You may write only inside a folder named after your own user id, so one
-- member of staff cannot replace another's picture.
create policy "staff write own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'staff-avatars'
    and public.is_staff()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "staff update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'staff-avatars'
    and public.is_staff()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "staff delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'staff-avatars'
    and public.is_staff()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins and the owner can tidy up anybody's, for the day somebody uploads
-- something they should not have.
create policy "admins manage all avatars"
  on storage.objects for all
  using (bucket_id = 'staff-avatars' and public.is_admin())
  with check (bucket_id = 'staff-avatars' and public.is_admin());
