import {
  daysSince,
  formatDate,
  formatDateTime,
  type AccountStatus,
} from "./account-status";
import { ResendInvite } from "./ResendInvite";

/**
 * The badge on the collapsed row.
 *
 * Only invited accounts get one. An account that was never invited has no
 * invite to report on, and a badge saying so would be noise on every row.
 */
export function InvitePill({ status }: { status: AccountStatus | undefined }) {
  if (!status || status.state === "direct") return null;

  if (status.state === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Invite pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
      <span aria-hidden>✓</span>
      Invite accepted
    </span>
  );
}

/** The one-line version that sits under the name in the collapsed row. */
export function InviteLine({ status }: { status: AccountStatus | undefined }) {
  if (!status || status.state === "direct") return null;

  if (status.state === "pending") {
    const sent = formatDate(status.invitedAt);
    return (
      <span className="mt-1 block truncate text-xs font-medium text-amber-800">
        Invite sent{sent ? ` ${sent}` : ""} — waiting for them to accept
      </span>
    );
  }

  const accepted = formatDate(status.acceptedAt ?? status.lastSignInAt);
  return (
    <span className="mt-1 block truncate text-xs font-medium text-emerald-800">
      Accepted{accepted ? ` ${accepted}` : ""}
      {status.lastSignInAt
        ? ` · last signed in ${formatDate(status.lastSignInAt)}`
        : " · not signed in yet"}
    </span>
  );
}

/** The full account of where the invite stands, inside the opened row. */
export function InvitePanel({
  status,
  email,
  canResend,
}: {
  status: AccountStatus | undefined;
  email: string | null;
  canResend: boolean;
}) {
  if (!status) return null;

  if (status.state === "pending") {
    const sent = formatDateTime(status.invitedAt);
    const age = daysSince(status.invitedAt);

    return (
      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">
          Invite sent — not accepted yet
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
          The email went out{sent ? ` on ${sent}` : ""}
          {email ? ` to ${email}` : ""}. They have not opened the link, so they
          have no password and cannot sign in. Nothing on this page takes
          effect for them until they accept.
        </p>

        {age !== null && age >= 3 ? (
          <p className="mt-2 text-sm font-medium text-amber-900">
            That was {age} days ago. If it landed in spam, send it again —
            the new link replaces the old one.
          </p>
        ) : null}

        {canResend && email ? <ResendInvite email={email} /> : null}
      </div>
    );
  }

  if (status.state === "accepted" && status.invitedAt) {
    const accepted = formatDateTime(status.acceptedAt ?? status.lastSignInAt);
    const lastIn = formatDateTime(status.lastSignInAt);

    return (
      <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">
          Invite accepted
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-900">
          They opened the link{accepted ? ` on ${accepted}` : ""} and set their
          own password.{" "}
          {lastIn
            ? `Last signed in ${lastIn}.`
            : "They have not signed in since."}{" "}
          Switch them on below when you want them in the console.
        </p>
      </div>
    );
  }

  // Accounts nobody invited — the first admin. Worth a line, not a banner.
  const lastIn = formatDateTime(status.lastSignInAt);
  if (!lastIn) return null;

  return (
    <p className="mb-5 text-xs text-navy-700/70">
      This account was not created by an invite. Last signed in {lastIn}.
    </p>
  );
}
