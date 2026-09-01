-- Product pictures that live outside the bucket.
--
-- vehicle_photos already carries remote_url for images served from a partner
-- feed. Product images need the same escape hatch for the four launch designs,
-- whose artwork ships in the repo under /brand/shop/. Uploads through the
-- admin still write storage_path; exactly one of the two is always set.

alter table public.product_images
  add column if not exists external_url text;

alter table public.product_images
  alter column storage_path drop not null;

alter table public.product_images
  drop constraint if exists product_images_one_location;

alter table public.product_images
  add constraint product_images_one_location
  check (num_nonnulls(storage_path, external_url) = 1);

comment on column public.product_images.external_url is
  'Image served from somewhere other than the product-photos bucket (e.g. a file shipped in /public). Mutually exclusive with storage_path.';
