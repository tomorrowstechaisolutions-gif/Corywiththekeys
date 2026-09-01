# services/

Data-access layer. One file per domain (inventory, leads, applications,
trade-ins, appointments, customers, messages, partner lots). Each wraps the
Supabase client so pages and route handlers never query the database directly.

Empty for now — the database schema has not been designed yet.
