import { MediaTile } from "@/components/music/MediaTile";
import { Container } from "@/components/ui/Container";
import { SocialIcon } from "@/components/ui/SocialIcon";
import {
  LINKTREE_URL,
  NEW_RELEASE,
  STREAMING_LABELS,
  firstStreamingUrl,
  hasAnyStreaming,
  mediaImage,
  mediaUrl,
} from "@/data/cory-links";

export function NewRelease() {
  const release = NEW_RELEASE;
  const watchUrl = mediaUrl(release);
  const listenUrl = firstStreamingUrl(release.links);
  const artwork = release.artwork ?? mediaImage(release);
  const platforms = STREAMING_LABELS.filter((p) => release.links[p.key]);

  const title = release.featuring
    ? `${release.title} (feat. ${release.featuring})`
    : release.title;

  return (
    <section id="new-release" className="scroll-mt-20 bg-navy-950 pb-4 pt-10 lg:pt-12">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-navy-900 to-navy-950 p-5 sm:p-6 lg:p-7">
          <div className="grid gap-6 lg:grid-cols-[15rem_1fr_auto] lg:items-center lg:gap-8">
            <div className="mx-auto w-full max-w-56 lg:mx-0">
              <MediaTile
                image={artwork}
                alt={`${title} cover art`}
                href={watchUrl ?? listenUrl}
                aspect="square"
                showPlay={Boolean(watchUrl)}
                sizes="240px"
              />
            </div>

            <div>
              <span className="inline-block rounded bg-keyblue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                New Release
              </span>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                {release.blurb}
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {listenUrl ? (
                  <a
                    href={listenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-keyblue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-keyblue-500"
                  >
                    Listen Now <span aria-hidden>♪</span>
                  </a>
                ) : null}

                {watchUrl ? (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                  >
                    Watch Video <span aria-hidden>▷</span>
                  </a>
                ) : null}

                <a
                  href={LINKTREE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  All Platforms <span aria-hidden>↗</span>
                </a>
              </div>

              {!hasAnyStreaming(release.links) && !watchUrl ? (
                <p className="mt-4 text-xs text-white/45">
                  Streaming links are being added. In the meantime, everything
                  is on Cory&rsquo;s Linktree.
                </p>
              ) : null}
            </div>

            {platforms.length > 0 ? (
              <ul className="space-y-2 lg:w-48">
                {platforms.map((platform) => (
                  <li key={platform.key}>
                    <a
                      href={release.links[platform.key] as string}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                    >
                      <SocialIcon name={platform.key} className="h-7 w-7" />
                      {platform.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
