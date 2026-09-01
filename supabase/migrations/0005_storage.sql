-- =====================================================================
-- The Key Konnect — Storage buckets and policies
-- 0005_storage.sql
--
--   vehicle-photos    public read   — listing images
--   media             public read   — gallery / press assets
--   trade-in-photos   private       — customer-submitted, staff read only
--
-- There is no `application-documents` bucket in the initial release: the
-- site does not collect identity or financial documents. Public uploads
-- (trade-in photos) are written by a Server Action on the service-role
-- key after validation, so no anonymous INSERT policy is granted.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vehicle-photos',  'vehicle-photos',  true,  10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('media',           'media',           true,  52428800,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']),
  ('trade-in-photos', 'trade-in-photos', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- --- public buckets ---------------------------------------------------
create policy "public buckets: anyone reads"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('vehicle-photos', 'media'));

create policy "public buckets: staff write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('vehicle-photos', 'media') and public.can_write());

create policy "public buckets: staff update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('vehicle-photos', 'media') and public.can_write())
  with check (bucket_id in ('vehicle-photos', 'media') and public.can_write());

create policy "public buckets: staff delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('vehicle-photos', 'media') and public.can_write());

-- --- trade-in photos: staff only, both directions ---------------------
create policy "trade-in photos: staff read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'trade-in-photos' and public.is_staff());

create policy "trade-in photos: staff write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trade-in-photos' and public.can_write());

create policy "trade-in photos: staff delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trade-in-photos' and public.can_write());
