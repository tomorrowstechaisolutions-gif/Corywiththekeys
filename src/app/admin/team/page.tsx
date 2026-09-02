import type { Metadata } from "next";

import { Avatar } from "@/components/admin/Avatar";
import { Container } from "@/components/ui/Container";
import { navFor, sectionsForRole } from "@/lib/admin-nav";
import {
  displayName,
  isAdmin,
  isOwner,
  requireSection,
  ROLE_LABELS,
  type Profile,
} from "@/lib/auth";
import { avatarUrls, initials } from "@/lib/avatars";
import { serverEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

import { InviteForm } from "./InviteForm";
import { MemberForm } from "./MemberForm";

export const metadata: Metadata = { title: "Team" };

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-gold-600 text-white",
  admin: "bg-keyblue-600 text-white",
  sales: "bg-keyblue-600/10 text-keyblue-700",
  viewer: "bg-slate-200 text-slate-800",
};

/** A plain-language summary of what this person can reach. */
function accessSummary(member: Profile): string {
  if (member.role === "owner") return "Every section — the owner's seat";
  if (member.role === "admin") return "Every section";
  const allowed = navFor(member);
  if (member.sections === null) {
    return `Everything a ${ROLE_LABELS[member.role].toLowerCase()} can see (${sectionsForRole(member.role).length} sections)`;
  }
  if (allowed.length === 0) return "Nothing — no sections ticked";
  return allowed.map((item) => item.label).join(", ");
}

export default async function AdminTeamPage() {
  const profile = await requireSection("team");

  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("profiles")
    .select("*")
    .order("is_active", { ascending: false })
    .order("role")
    .order("email");

  const list = members ?? [];
  const photos = await avatarUrls(list);

  // Nobody owns the console yet, so an admin gets to name the first owner.
  // Once one exists this goes back to owner-only, in the actions and in the
  // database trigger both.
  const hasOwner = list.some((m) => m.role === "owner");
  const canAppointOwner = isOwner(profile) || !hasOwner;
  // Owner counts: they are a way back in too, so a lone owner alongside a
  // lone admin is not the "only one way in" situation the warning is about.
  const activeAdmins = list.filter(
    (m) => (m.role === "admin" || m.role === "owner") && m.is_active,
  );

  return (
    <Container className="py-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Team</h1>
        <p className="mt-1 text-sm text-navy-700">
          Who can sign in, what they can change, and which parts of the console
          they see.
        </p>
      </div>

      {!isAdmin(profile) ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Only an admin can change these.
        </p>
      ) : null}

      {activeAdmins.length === 1 ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          There is only one active admin ({displayName(activeAdmins[0])}). If
          that account is ever lost, nobody can let anyone back in. Worth making
          a second person an admin.
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load the team.
        </p>
      ) : null}

      <div className="mt-6">
        <InviteForm
          canInvite={serverEnv.hasServiceRole}
          actorIsOwner={canAppointOwner}
        />
      </div>

      <h2 className="mt-10 text-lg font-bold text-navy-900">
        {list.length} {list.length === 1 ? "person" : "people"}
      </h2>

      <div className="mt-4 space-y-4">
        {list.map((member) => (
          <details
            key={member.id}
            className="group rounded-lg border border-slate-200 bg-white"
            open={!member.is_active}
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-5">
              <Avatar
                url={photos.get(member.id) ?? null}
                initials={initials(displayName(member))}
                size={44}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy-900">
                  {displayName(member)}
                  {member.id === profile.id ? (
                    <span className="ml-2 text-xs font-normal text-navy-700/60">
                      (you)
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-xs text-navy-700">
                  {member.email}
                  {member.title ? ` · ${member.title}` : ""}
                </span>
                <span className="mt-1 block truncate text-xs text-navy-700/70">
                  {accessSummary(member)}
                </span>
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[member.role]}`}
              >
                {ROLE_LABELS[member.role]}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  member.is_active
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {member.is_active ? "Active" : "Not active"}
              </span>

              <span
                aria-hidden
                className="text-navy-700/50 transition group-open:rotate-90"
              >
                ›
              </span>
            </summary>

            <div className="border-t border-slate-200 p-5">
              {isAdmin(profile) ? (
                <MemberForm actorIsOwner={canAppointOwner} member={member} isSelf={member.id === profile.id} />
              ) : (
                <p className="text-sm text-navy-700">
                  Only an admin can change this.
                </p>
              )}
            </div>
          </details>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-navy-700/70">
        Nobody here ever sees anybody else&rsquo;s password — invited staff set
        their own from the email link, and if they lose it they reset it the
        same way. Hiding a section stops it appearing and stops the page opening
        directly; the underlying data is still governed by the role, so give
        Viewer to anyone who should only look.
      </p>
    </Container>
  );
}
