-- =====================================================================
-- The Key Konnect — attribute "Have Cory Find My Car" separately
-- 0010_lead_source_find_my_car.sql
--
-- The inventory page's lead form is a distinct intent: the customer looked
-- through the inventory, did not find it, and asked Cory to source one.
-- Folding it into 'vehicle_inquiry' would blur two very different signals
-- in /admin/analytics — one means "I want THAT car", the other means
-- "I could not find what I want".
-- =====================================================================

alter type lead_source add value if not exists 'find_my_car';
