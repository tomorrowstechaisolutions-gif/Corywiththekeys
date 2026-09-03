import "server-only";

import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Where somebody is in the invite journey.
 *
 * `profiles` deliberately does not store this. Whether an invite has been
 * opened lives in Supabase's own auth table, and duplicating it into a column
 * we would have to keep in step is how the two end up disagreeing. So it is
 * read straight from the source, on the service-role key, and joined to the
 * profile rows by id.
 *
 *   pending  — the invite email went out and nobody has opened it yet.
 *   accepted — they followed the link and set their password.
 *   direct   — the account was not created by an invite (the first admin).
 */
export type AccountState = "pending" | "accepted" | "direct";

export type AccountStatus = {
  state: AccountState;
  invitedAt: string | null;
  acceptedAt: string | null;
  lastSignInAt: string | null;
};

/**
 * id → invite status for every auth user.
 *
 * Returns an empty map when the service-role key is missing, which is the
 * same condition that disables inviting in the first place; callers treat a
 * missing entry as "nothing to say" rather than as an error.
 */
export async function accountStatuses(): Promise<Map<string, AccountStatus>> {
  const out = new Map<string, AccountStatus>();
  if (!serverEnv.hasServiceRole) return out;

  const admin = createAdminClient();
  const perPage = 200;

  // Paged, because listUsers caps a page and a silently truncated list would
  // show a real member as having no invite history at all.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error("[team] could not read invite status", error.message);
      break;
    }

    const users = data?.users ?? [];

    for (const user of users) {
      const invitedAt = user.invited_at ?? null;
      const acceptedAt = user.email_confirmed_at ?? user.confirmed_at ?? null;
      const lastSignInAt = user.last_sign_in_at ?? null;

      // Either half is proof they got in: the link confirms the address, and
      // a sign-in could not have happened without it.
      const accepted = Boolean(acceptedAt) || Boolean(lastSignInAt);

      out.set(user.id, {
        state: accepted ? "accepted" : invitedAt ? "pending" : "direct",
        invitedAt,
        acceptedAt,
        lastSignInAt,
      });
    }

    if (users.length < perPage) break;
  }

  return out;
}

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Chicago",
});

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Chicago",
});

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : DATE.format(date);
}

export function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : DATE_TIME.format(date);
}

/** Whole days since a timestamp, or null. Used to nudge on a stale invite. */
export function daysSince(value: string | null): number | null {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}
