/**
 * The walkaround video.
 *
 * Staff paste whatever URL they have — a watch link, a share link, a Shorts
 * link — so the id is pulled out here rather than asking them to know the
 * embed format. Anything that is not a YouTube URL renders as a plain link
 * instead of an embed, which is honest about what we can and cannot play.
 */
export function youTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (match) return match[1];
    }
  } catch {
    // Not a URL we can read — fall through to the plain link.
  }
  return null;
}

export function VehicleVideo({ url, title }: { url: string; title: string }) {
  const id = youTubeId(url);

  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:border-keyblue-500 hover:text-keyblue-600"
      >
        Watch the walkaround video
        <span aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-navy-950">
      <iframe
        // youtube-nocookie: no tracking cookie is set unless the visitor plays it.
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title={`Walkaround video — ${title}`}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
