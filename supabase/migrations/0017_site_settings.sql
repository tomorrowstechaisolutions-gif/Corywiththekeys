-- Business details Cory can change himself, without a code deploy.
--
-- Split across two tables on purpose. Everything in site_settings and
-- business_hours is already printed on the public website, so anonymous
-- visitors may read it. Notification routing is internal, so it lives in its
-- own table that only admins can read. One table with a clever view would
-- have leaked his private inbox to anyone who asked the API nicely.

create table public.site_settings (
  -- Exactly one row, forever. The check makes a second row impossible rather
  -- than merely unlikely.
  id boolean primary key default true,
  constraint site_settings_single_row check (id),

  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,

  facebook_url text,
  instagram_url text,
  tiktok_url text,
  snapchat_url text,
  youtube_url text,
  linktree_url text,

  -- Site switches.
  shop_checkout_enabled boolean not null default false,
  show_inventory_prices boolean not null default true,
  announcement_enabled boolean not null default false,
  announcement_text text,
  announcement_href text,

  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,

  -- A banner that is switched on but says nothing is a broken banner.
  constraint site_settings_announcement_needs_text
    check (not announcement_enabled or coalesce(btrim(announcement_text), '') <> ''),
  constraint site_settings_announcement_text_length
    check (announcement_text is null or char_length(announcement_text) <= 240)
);

comment on table public.site_settings is
  'Single-row business configuration shown on the public site.';

-- 0 = Monday through 6 = Sunday. Not Postgres'' dow (which starts on Sunday):
-- the website lists the week starting Monday, and ordering by this column
-- should produce that order without a CASE expression at every call site.
create table public.business_hours (
  day_of_week smallint primary key check (day_of_week between 0 and 6),
  is_closed boolean not null default false,
  opens time,
  closes time,
  updated_at timestamptz not null default now(),

  constraint business_hours_times_present
    check (is_closed or (opens is not null and closes is not null)),
  constraint business_hours_closes_after_opens
    check (is_closed or closes > opens)
);

comment on table public.business_hours is
  'Opening hours, one row per weekday. 0 = Monday, 6 = Sunday.';

-- Internal. Never exposed to the public site.
create table public.notification_settings (
  id boolean primary key default true,
  constraint notification_settings_single_row check (id),

  leads_email text,
  messages_email text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

comment on table public.notification_settings is
  'Where internal notifications should go. Admin-only: this is Cory''s private inbox, not public contact detail. Nothing sends mail yet — these values are stored, not acted on.';

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger business_hours_updated_at
  before update on public.business_hours
  for each row execute function public.set_updated_at();

create trigger notification_settings_updated_at
  before update on public.notification_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.site_settings force row level security;
alter table public.business_hours enable row level security;
alter table public.business_hours force row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_settings force row level security;

-- Public reads: this is the same information already printed in the footer.
create policy "site settings are public"
  on public.site_settings for select
  using (true);

create policy "business hours are public"
  on public.business_hours for select
  using (true);

-- Only admins change any of it, and nobody inserts or deletes: the rows are
-- seeded below and are meant to be edited in place forever.
create policy "admins update site settings"
  on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());

create policy "admins update business hours"
  on public.business_hours for update
  using (public.is_admin()) with check (public.is_admin());

create policy "admins read notification settings"
  on public.notification_settings for select
  using (public.is_admin());

create policy "admins update notification settings"
  on public.notification_settings for update
  using (public.is_admin()) with check (public.is_admin());

create trigger site_settings_audit
  after update on public.site_settings
  for each row execute function public.write_audit_log();

create trigger notification_settings_audit
  after update on public.notification_settings
  for each row execute function public.write_audit_log();

-- Seed with exactly what the website says today, so switching the site over
-- to these tables changes nothing visible until Cory edits something.
insert into public.site_settings (
  id, phone, email,
  address_line1, address_line2, city, state, postal_code,
  facebook_url, instagram_url, tiktok_url, snapchat_url, youtube_url, linktree_url
) values (
  true, '254-987-0063', 'info@thekeykonnect.com',
  '502 E Veterans Memorial Blvd', 'Suite B', 'Killeen', 'TX', '76541',
  'https://www.facebook.com/iamcorywiththekeys',
  'https://www.instagram.com/corywiththekeys',
  'https://www.tiktok.com/@corywthekeys',
  'https://www.snapchat.com/@corywiththekeys',
  'https://www.youtube.com/@Corywthekeys',
  'https://linktr.ee/corywiththekeys'
);

insert into public.notification_settings (id) values (true);

insert into public.business_hours (day_of_week, is_closed, opens, closes) values
  (0, false, '09:00', '19:00'),
  (1, false, '09:00', '19:00'),
  (2, false, '09:00', '19:00'),
  (3, false, '09:00', '19:00'),
  (4, false, '09:00', '19:00'),
  (5, false, '10:00', '17:00'),
  (6, true, null, null);
