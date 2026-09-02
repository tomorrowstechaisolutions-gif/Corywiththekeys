/*
 * What turns a list of enquiries into a CRM.
 *
 * The leads table already held who and what. What it could not answer is the
 * only question that actually costs a dealership money: which of these has
 * nobody spoken to, and when did we say we would call them back.
 *
 * Two columns and a timeline, no more. A follow-up date, a last-touched
 * stamp so the list can sort by neglect, and a record of everything that
 * happened to the lead.
 */

alter table public.leads
  -- A date, not a timestamp. Nobody promises to ring back at 14:30; they say
  -- "Thursday". Storing an hour we invented would make "overdue" arbitrary.
  add column if not exists next_follow_up_at date,
  add column if not exists last_activity_at timestamptz not null default now();

comment on column public.leads.next_follow_up_at is
  'The day we said we would chase this. Null means nothing is scheduled.';
comment on column public.leads.last_activity_at is
  'Maintained by trigger. Denormalised so the list can order by neglect without a join.';

create index if not exists leads_follow_up_idx
  on public.leads (next_follow_up_at)
  where next_follow_up_at is not null;

create index if not exists leads_open_activity_idx
  on public.leads (last_activity_at desc);

create type public.lead_event_type as enum (
  'note',
  'status_change',
  'assignment',
  'contact_logged',
  'follow_up_set'
);

/*
 * One timeline per lead, holding both what staff wrote and what the system
 * noticed. Keeping notes and status changes in the same table is deliberate:
 * two tables would mean merging them in the UI on every render, and the
 * question being asked is always "what happened to this lead, in order".
 */
create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type public.lead_event_type not null,
  body text,
  from_status public.lead_status,
  to_status public.lead_status,
  -- Null when the system wrote it, or when the person has since been deleted.
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint lead_events_note_has_body
    check (type <> 'note' or coalesce(btrim(body), '') <> ''),
  constraint lead_events_body_length
    check (body is null or char_length(body) <= 4000)
);

comment on table public.lead_events is
  'Everything that has happened to a lead: notes staff wrote, and status, assignment and contact changes logged automatically.';

create index lead_events_lead_idx
  on public.lead_events (lead_id, created_at desc);

alter table public.lead_events enable row level security;
alter table public.lead_events force row level security;

create policy "lead events: staff read"
  on public.lead_events for select using (public.is_staff());

create policy "lead events: staff write"
  on public.lead_events for all
  using (public.can_write()) with check (public.can_write());

grant select on public.lead_events to authenticated;
grant insert, update, delete on public.lead_events to authenticated;

/*
 * The timeline writes itself.
 *
 * Asking the app to remember to log every change is how a timeline ends up
 * with holes in it — one code path forgets, and afterwards nobody trusts the
 * history. The trigger sees every write however it arrives.
 */
create or replace function public.log_lead_changes()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
declare
  v_author uuid := auth.uid();
begin
  if new.status is distinct from old.status then
    insert into public.lead_events (lead_id, type, from_status, to_status, author_id)
    values (new.id, 'status_change', old.status, new.status, v_author);
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_events (lead_id, type, body, author_id)
    values (
      new.id,
      'assignment',
      case
        when new.assigned_to is null then 'Unassigned'
        else 'Assigned to ' || coalesce(
          (select coalesce(full_name, email) from public.profiles where id = new.assigned_to),
          'somebody'
        )
      end,
      v_author
    );
  end if;

  if new.next_follow_up_at is distinct from old.next_follow_up_at then
    insert into public.lead_events (lead_id, type, body, author_id)
    values (
      new.id,
      'follow_up_set',
      case
        when new.next_follow_up_at is null then 'Follow-up cleared'
        else 'Follow-up set for ' || to_char(new.next_follow_up_at, 'FMDay DD Month')
      end,
      v_author
    );
  end if;

  return new;
end;
$$;

create trigger leads_log_changes
  after update on public.leads
  for each row execute function public.log_lead_changes();

/*
 * last_activity_at follows the timeline rather than the lead row, so an
 * automated field update does not make a neglected lead look attended to.
 * Anything worth appearing in the history counts as activity; nothing else
 * does.
 */
create or replace function public.touch_lead_activity()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
begin
  update public.leads
     set last_activity_at = new.created_at
   where id = new.lead_id
     and last_activity_at < new.created_at;
  return new;
end;
$$;

create trigger lead_events_touch_lead
  after insert on public.lead_events
  for each row execute function public.touch_lead_activity();

-- A brand new enquiry starts its own timeline, so the history never begins
-- halfway through.
create or replace function public.log_lead_created()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
begin
  insert into public.lead_events (lead_id, type, body, to_status)
  values (
    new.id,
    'status_change',
    'Enquiry received',
    new.status
  );
  return new;
end;
$$;

create trigger leads_log_created
  after insert on public.leads
  for each row execute function public.log_lead_created();
