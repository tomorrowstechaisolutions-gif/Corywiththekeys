-- Brand marks and wording, editable from the admin console.
--
-- The sign-in logo, the console mark, the browser tab icon and the two lines
-- of type under the logo were all compiled into the code. Changing any of them
-- meant a developer and a deploy. They live here now so the business can
-- change its own branding without one.
--
-- Paths only, never URLs. Each points at an object in the public `media`
-- bucket, whose policies already say: anybody may read, only staff passing
-- can_write() may write. Storing the path rather than a full URL means the
-- project can move without every logo breaking, and means nothing a person
-- typed ends up in an `src` attribute.
--
-- NULL means "use the mark compiled into the code". Every row starts NULL, so
-- nothing changes for anybody until somebody uploads something.

alter table public.site_settings
  add column login_logo_path  text,
  add column admin_mark_path  text,
  add column favicon_path     text,
  add column brand_wordmark   text,
  add column brand_tagline    text;

comment on column public.site_settings.login_logo_path is
  'Object path in the `media` bucket for the staff sign-in mark. NULL = the mark compiled into the code.';
comment on column public.site_settings.admin_mark_path is
  'Object path in the `media` bucket for the admin console rail mark. NULL = text only, no mark.';
comment on column public.site_settings.favicon_path is
  'Object path in the `media` bucket for the browser tab icon. NULL = src/app/icon.png.';
comment on column public.site_settings.brand_wordmark is
  'Business name shown under the sign-in mark. NULL = SITE.name from constants.ts.';
comment on column public.site_settings.brand_tagline is
  'Small line under the wordmark on sign-in. NULL = SITE.tagline from constants.ts.';

-- A path is a path. Without this, a saved value of 'https://evil.example/x.png'
-- or '../../another-bucket/x' would be pasted straight into an image src. The
-- app validates the same thing in zod; this is the copy that cannot be
-- bypassed by a forged request.
alter table public.site_settings
  add constraint site_settings_brand_paths_are_relative check (
    (login_logo_path is null or (login_logo_path !~ '^[a-zA-Z]+:' and login_logo_path !~ '\.\.' and login_logo_path !~ '^/' and length(login_logo_path) <= 300))
    and
    (admin_mark_path is null or (admin_mark_path !~ '^[a-zA-Z]+:' and admin_mark_path !~ '\.\.' and admin_mark_path !~ '^/' and length(admin_mark_path) <= 300))
    and
    (favicon_path is null or (favicon_path !~ '^[a-zA-Z]+:' and favicon_path !~ '\.\.' and favicon_path !~ '^/' and length(favicon_path) <= 300))
  );

alter table public.site_settings
  add constraint site_settings_brand_text_length check (
    (brand_wordmark is null or length(brand_wordmark) between 1 and 60)
    and
    (brand_tagline is null or length(brand_tagline) between 1 and 80)
  );
