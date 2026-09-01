-- =====================================================================
-- The Key Konnect — track the previous price so "Price Drop" is real
-- 0011_price_history.sql
--
-- The approved inventory design shows a PRICE DROP badge. Without stored
-- history that badge would be decoration — there is no way to know a price
-- fell. This records the prior price whenever one is lowered, so the badge
-- means something and can be trusted by a customer.
--
-- Only DROPS are recorded. Raising a price clears the marker rather than
-- leaving a stale "was cheaper" note on the listing.
-- =====================================================================

alter table public.vehicles
  add column previous_price numeric(10, 2),
  add column price_changed_at timestamptz;

comment on column public.vehicles.previous_price is
  'The price before the most recent reduction. Null when the current price is not a reduction.';

create or replace function public.track_vehicle_price_drop()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.price is distinct from old.price then
    if old.price is not null
       and new.price is not null
       and new.price < old.price
    then
      new.previous_price := old.price;
    else
      new.previous_price := null;
    end if;

    new.price_changed_at := now();
  end if;

  return new;
end;
$$;

-- Named to sort AFTER vehicles_apply_overrides, which settles the final
-- price first when a feed sync is running.
create trigger vehicles_track_price_drop
  before update on public.vehicles
  for each row execute function public.track_vehicle_price_drop();

revoke execute on function public.track_vehicle_price_drop() from public, anon, authenticated;

-- Surface it on the public view alongside everything else.
drop view if exists public.published_vehicles;

create view public.published_vehicles
with (security_invoker = true)
as
  select v.*, p.name as partner_lot_name, p.slug as partner_lot_slug
    from public.vehicles v
    left join public.partner_lots p on p.id = v.partner_lot_id
   where v.status in ('available', 'pending');

grant select on public.published_vehicles to anon, authenticated;
