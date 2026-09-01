-- Merch catalogue.
--
-- The store used to be a hard-coded array in src/data/shop.ts, which meant a
-- price change was a code deploy. These tables put products behind the same
-- pattern as vehicle inventory: staff write through Server Actions on their own
-- session, RLS is the final word, and the public can only read what is
-- published.

create type public.product_status as enum ('draft', 'published', 'archived');
create type public.product_stock  as enum ('in_stock', 'sold_out', 'coming_soon');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'Merch',
  subtitle text,
  description text,
  details text[] not null default '{}',
  price numeric(10,2) not null check (price >= 0),
  compare_at numeric(10,2) check (compare_at >= 0),
  collection text,
  sizes text[] not null default '{}',
  -- [{ "name": "Red", "hex": "#c0231f" }] — the swatch dots on the storefront.
  colors jsonb not null default '[]'::jsonb,
  is_new boolean not null default false,
  status public.product_status not null default 'draft',
  stock public.product_stock not null default 'in_stock',
  position integer not null default 0,
  -- True while the imagery is the designer's render rather than a photograph
  -- of the real garment. Checkout stays off while any product has this set.
  photography_is_render boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt text,
  position integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- One main picture per product, enforced rather than assumed.
create unique index product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;

create index product_images_product_idx on public.product_images (product_id);
create index products_status_position_idx on public.products (status, position);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Row level security ────────────────────────────────────────────────────
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.product_images enable row level security;
alter table public.product_images force row level security;

create policy "products: public reads published"
  on public.products for select
  using (status = 'published');

create policy "products: staff read all"
  on public.products for select to authenticated
  using (public.is_staff());

create policy "products: staff write"
  on public.products for insert to authenticated
  with check (public.can_write());

create policy "products: staff update"
  on public.products for update to authenticated
  using (public.can_write()) with check (public.can_write());

create policy "products: admin delete"
  on public.products for delete to authenticated
  using (public.is_admin());

create policy "product images: public reads published"
  on public.product_images for select
  using (exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'published'
  ));

create policy "product images: staff read all"
  on public.product_images for select to authenticated
  using (public.is_staff());

create policy "product images: staff write"
  on public.product_images for insert to authenticated
  with check (public.can_write());

create policy "product images: staff update"
  on public.product_images for update to authenticated
  using (public.can_write()) with check (public.can_write());

create policy "product images: staff delete"
  on public.product_images for delete to authenticated
  using (public.can_write());

-- Supabase grants broadly by default; narrow it back to what the policies need.
revoke all on public.products from public, anon, authenticated;
revoke all on public.product_images from public, anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;

-- ── Storage ───────────────────────────────────────────────────────────────
-- Product photography lives in its own public bucket. The four
-- "public buckets: ..." policies on storage.objects enumerate bucket ids, so
-- they are recreated here with product-photos added rather than duplicated.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- The bucket policies enumerate ids, so they are dropped and recreated with
-- product-photos in the list. Reading is public (the storefront needs it);
-- writing, updating and deleting require can_write().
drop policy if exists "public buckets: anyone reads" on storage.objects;
drop policy if exists "public buckets: staff write"  on storage.objects;
drop policy if exists "public buckets: staff update" on storage.objects;
drop policy if exists "public buckets: staff delete" on storage.objects;

create policy "public buckets: anyone reads"
  on storage.objects for select
  using (bucket_id = any (array['vehicle-photos', 'media', 'product-photos']));

create policy "public buckets: staff write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = any (array['vehicle-photos', 'media', 'product-photos'])
    and public.can_write()
  );

create policy "public buckets: staff update"
  on storage.objects for update to authenticated
  using (
    bucket_id = any (array['vehicle-photos', 'media', 'product-photos'])
    and public.can_write()
  )
  with check (
    bucket_id = any (array['vehicle-photos', 'media', 'product-photos'])
    and public.can_write()
  );

create policy "public buckets: staff delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = any (array['vehicle-photos', 'media', 'product-photos'])
    and public.can_write()
  );
