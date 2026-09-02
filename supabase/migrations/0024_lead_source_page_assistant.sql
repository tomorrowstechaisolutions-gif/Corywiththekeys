-- =====================================================================
-- The Key Konnect — attribute the floating page assistant separately
-- 0024_lead_source_page_assistant.sql
--
-- The assistant is its own intent signal: the visitor was mid-browse and
-- asked a question there and then, rather than navigating to /contact and
-- filling in a form. Folding it into 'contact_form' would hide whether the
-- widget earns its place, and would blur the one number that tells Cory
-- whether his contact page is working.
-- =====================================================================

alter type lead_source add value if not exists 'page_assistant';
