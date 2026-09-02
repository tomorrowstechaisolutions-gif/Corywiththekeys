import { SectionHeading } from "@/components/music/SectionHeading";
import { Container } from "@/components/ui/Container";
import { LINKTREE_URL, LISTEN_PROFILES, PROFILES } from "@/data/cory-links";

export function FollowCory() {
  return (
    <section className="bg-navy-950 py-8 lg:py-10">
      <Container>
        <SectionHeading title="Listen to Cory" />

        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LISTEN_PROFILES.map((profile) => (
            <li key={profile.key}>
              <a
                href={profile.url as string}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
              >
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${profile.accent}`}
                >
                  {profile.label.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-white">
                    {profile.label}
                  </span>
                  <span className="block truncate text-xs text-white/50">
                    Full catalogue
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-9">
          <SectionHeading title="Follow Cory" />
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PROFILES.map((profile) => {
            const inner = (
              <>
                <span
                  aria-hidden
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${profile.accent}`}
                >
                  {profile.label.charAt(0)}
                </span>
                <span className="mt-2.5 block text-sm font-bold text-white">
                  {profile.label}
                </span>
                {profile.handle ? (
                  <span className="block truncate text-xs text-white/50">
                    {profile.handle}
                  </span>
                ) : null}
              </>
            );

            // No URL yet: render the card, but not as a link. A social card
            // that goes nowhere is worse than one that clearly isn't live.
            return (
              <li key={profile.key}>
                {profile.url ? (
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-55">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}

          <li>
            <a
              href={LINKTREE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between rounded-xl bg-keyblue-600 p-4 transition hover:bg-keyblue-500"
            >
              <div>
                <span className="block text-sm font-bold text-white">
                  All Cory Links
                </span>
                <span className="mt-0.5 block text-xs text-white/80">
                  Everything in one place.
                </span>
              </div>
              <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded bg-black/25 px-2.5 py-1 text-[11px] font-bold text-white">
                Open Linktree <span aria-hidden>↗</span>
              </span>
            </a>
          </li>
        </ul>
      </Container>
    </section>
  );
}
