import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { navFor } from "@/lib/admin-nav";
import { displayName, requireStaff, ROLE_LABELS } from "@/lib/auth";
import { avatarUrl, initials } from "@/lib/avatars";

import { AvatarUploader } from "./AvatarUploader";
import { MyProfileForm } from "./MyProfileForm";

export const metadata: Metadata = { title: "Your profile" };

/** Always the signed-in person's own record, so never cached. */
export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  // Deliberately requireStaff, not requireSection. This is everyone's own
  // record — an employee restricted to Inventory still gets to set their own
  // name and photo, so gating it behind a section would be wrong.
  const profile = await requireStaff();
  const url = await avatarUrl(profile);

  const sections = navFor(profile);

  return (
    <Container className="py-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Your profile</h1>
        <p className="mt-1 max-w-2xl text-sm text-navy-700">
          How you appear to the rest of the team inside this console.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-navy-900">Your picture</h2>
          <div className="mt-5">
            <AvatarUploader
              userId={profile.id}
              initialUrl={url}
              initials={initials(displayName(profile))}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-navy-900">Your details</h2>
          <div className="mt-5">
            <MyProfileForm profile={profile} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-navy-900">Your access</h2>
          <p className="mt-1 text-sm text-navy-700">
            Set by an admin, and shown here so you know where you stand.
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                Role
              </dt>
              <dd className="mt-1 text-sm font-semibold text-navy-900">
                {ROLE_LABELS[profile.role]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                Sections you can open
              </dt>
              <dd className="mt-1 text-sm text-navy-900">
                {profile.sections === null
                  ? `Everything your role allows (${sections.length})`
                  : sections.length === 0
                    ? "None"
                    : sections.map((item) => item.label).join(", ")}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-navy-700/70">
            Changing your own role or switching yourself off is not possible
            from here, and would not be from anywhere else either — the
            database refuses it. Ask an admin if something needs changing.
          </p>
        </section>
      </div>
    </Container>
  );
}
