-- Six pictures per product, enforced in the database.
--
-- The admin action already refuses the seventh, but it is not the only writer:
-- the seed script and any future bulk import insert these rows directly with
-- the service role, which no application check would see. A cap that only one
-- code path respects is not a cap.
--
-- Six is a product page, not an archive — front, back, print detail, worn. The
-- number is mirrored as MAX_PRODUCT_PHOTOS in src/lib/validation/product.ts;
-- changing one means changing the other.

create or replace function public.enforce_product_image_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
    from public.product_images
   where product_id = new.product_id;

  if v_count >= 6 then
    raise exception
      'A product may have at most 6 images (product % already has %).',
      new.product_id, v_count
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger product_images_limit
  before insert on public.product_images
  for each row execute function public.enforce_product_image_limit();
