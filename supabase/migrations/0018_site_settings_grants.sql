-- Grants are explicit in this project, so the new tables need them spelled
-- out. Deliberately narrow, and narrower than the policies: no role but
-- service_role may INSERT or DELETE, so the single-row shape of these tables
-- cannot be broken even by a mistake in a policy later.

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

grant select on public.business_hours to anon, authenticated;
grant update on public.business_hours to authenticated;

-- Not granted to anon at all. Cory's private inbox is protected twice over:
-- once by the admin-only policy, and once by simply not being reachable by
-- an anonymous API key.
grant select, update on public.notification_settings to authenticated;
