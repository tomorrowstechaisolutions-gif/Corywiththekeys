-- Adds the enum value on its own.
--
-- Postgres will not let a newly added enum value be USED in the same
-- transaction that added it, so everything that reads or writes 'owner'
-- lives in the next migration. Splitting them is not tidiness, it is the
-- only order that works.
--
-- 'owner' sorts before 'admin', so "order by role" puts Cory at the top of
-- the team list without a CASE expression.
alter type public.user_role add value if not exists 'owner' before 'admin';
