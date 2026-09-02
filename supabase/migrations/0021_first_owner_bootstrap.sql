/*
 * Somebody has to appoint the first owner.
 *
 * 0020 said only an owner may hand out the owner's seat, which is right once
 * there is one — and impossible before. The console shipped with a single
 * admin and no owner, so as written the role could never be used at all.
 *
 * So: while no owner exists, an admin may appoint the first. The moment one
 * does, this branch stops applying and the rule from 0020 takes over. It is
 * deliberately narrow — it permits creating an owner, never demoting or
 * deactivating one, and only an admin can reach it.
 */
create or replace function public.protect_owner_seat()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
declare
  v_actor public.user_role;
  v_touching_owner boolean;
  v_owner_exists boolean;
begin
  v_touching_owner :=
       (old.role = 'owner' and (new.role <> 'owner'
                                or new.is_active is distinct from old.is_active))
    or (new.role = 'owner' and old.role <> 'owner');

  if not v_touching_owner then
    return new;
  end if;

  -- Invites run on the service-role key, where there is no signed-in user to
  -- check. The server action behind that flow does its own check.
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  select role into v_actor from public.profiles where id = auth.uid();

  if v_actor = 'owner' then
    return new;
  end if;

  select exists (
    select 1 from public.profiles
     where role = 'owner' and id <> new.id
  ) into v_owner_exists;

  -- The one-time bootstrap: an admin naming the first owner.
  if not v_owner_exists
     and new.role = 'owner'
     and old.role <> 'owner'
     and v_actor = 'admin'
  then
    return new;
  end if;

  raise exception
    'Only the owner can appoint or remove an owner.'
    using errcode = 'insufficient_privilege';
end;
$$;
