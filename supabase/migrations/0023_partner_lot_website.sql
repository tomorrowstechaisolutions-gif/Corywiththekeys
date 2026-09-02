-- A partner lot's own website, so staff can jump straight from the admin
-- list to the dealer's site. http(s) only: a `javascript:` URL in an href is
-- a stored XSS, and this column is read back into a link.
alter table public.partner_lots
  add column if not exists website text;

alter table public.partner_lots
  drop constraint if exists partner_lots_website_http;

alter table public.partner_lots
  add constraint partner_lots_website_http
  check (website is null or website ~* '^https?://[^[:space:]]+$');

comment on column public.partner_lots.website is
  'Public website for the lot. Enforced http(s) — rendered as a clickable link.';
