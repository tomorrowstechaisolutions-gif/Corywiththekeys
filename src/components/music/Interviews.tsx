import { MediaTile } from "@/components/music/MediaTile";
import { SectionHeading } from "@/components/music/SectionHeading";
import { Container } from "@/components/ui/Container";
import { ALL_FEATURES_URL, FEATURES, mediaImage, mediaUrl } from "@/data/cory-links";

export function Interviews() {
  if (FEATURES.length === 0) return null;

  const [lead, ...rest] = FEATURES;
  const leadUrl = mediaUrl(lead);

  return (
    <section className="bg-navy-950 py-8 lg:py-10">
      <Container>
        <SectionHeading
          title="Interviews & Features"
          viewAllLabel="View all"
          viewAllUrl={ALL_FEATURES_URL}
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.9fr_1fr_1fr]">
          <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:flex">
            <div className="sm:w-64 sm:shrink-0">
              <MediaTile
                image={mediaImage(lead)}
                alt={lead.title}
                href={leadUrl}
                sizes="(max-width: 640px) 100vw, 256px"
              />
            </div>

            <div className="flex flex-1 flex-col justify-center p-5">
              <h3 className="text-base font-bold leading-snug text-white">
                {lead.eyebrow ? `${lead.eyebrow}: ` : ""}
                {lead.title}
              </h3>
              {lead.description ? (
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {lead.description}
                </p>
              ) : null}

              {leadUrl ? (
                <a
                  href={leadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-md border border-white/25 px-4 py-2 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  {lead.ctaLabel} <span aria-hidden>▷</span>
                </a>
              ) : (
                <p className="mt-4 text-xs text-white/40">Link coming soon.</p>
              )}
            </div>
          </article>

          {rest.map((feature) => {
            const url = mediaUrl(feature);

            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-white/10"
              >
                <MediaTile
                  image={mediaImage(feature)}
                  alt={feature.title}
                  href={url}
                  showPlay={Boolean(url)}
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />

                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/60 to-transparent p-4">
                  {feature.eyebrow ? (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      {feature.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="text-sm font-bold leading-snug text-white">
                    {feature.title}
                  </h3>
                  {feature.description ? (
                    <p className="mt-0.5 text-xs text-white/60">
                      {feature.description}
                    </p>
                  ) : null}

                  {url ? (
                    <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded border border-white/30 px-2.5 py-1 text-[11px] font-bold text-white">
                      {feature.ctaLabel} <span aria-hidden>▷</span>
                    </span>
                  ) : (
                    <span className="mt-2.5 text-[11px] text-white/40">
                      Link coming soon
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
