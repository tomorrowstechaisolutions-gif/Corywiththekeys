/*
 * An admin may switch a switched-off owner ON.
 *
 * 0020 and 0021 left one gap, and it is a deadlock rather than a nuisance.
 * An invited owner arrives inactive — every invited account does — and
 * 0021's bootstrap branch only covers CREATING the first owner, never
 * activating one that already exists. So the seat is filled, switched off,
 * and nobody can switch it on: the admin is refused because the row is an
 * owner, and the owner cannot sign in to do it himself because he is
 * inactive. Cory hit exactly this on 2026-09-08.
 *
 * The fix is deliberately one-directional. Switching somebody ON can never
 * lock anybody out of the business, so an admin may do it. Switching an
 * owner OFF, or demoting one, is still the owner's alone — that is the rule
 * that protects the person who owns the business, and it is untouched.
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

  -- An admin switching a switched-off owner on, and nothing else about the
  -- seat: the role must be unchanged, and is_active must be moving false to
  -- true. The reverse direction falls through to the refusal below.
  if v_actor = 'admin'
     and old.role = 'owner'
     and new.role = 'owner'
     and old.is_active is not true
     and new.is_active is true
  then
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
    'Only the owner can appoint an owner, or switch one off.'
    using errcode = 'insufficient_privilege';
end;
$$;
