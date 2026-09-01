"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A click-to-play YouTube player that repeats forever.
 *
 * WHY IT IS NOT AUTOPLAY
 * ----------------------
 * Chrome, Safari and Firefox all block audible autoplay until the visitor has
 * interacted with the page. A song set to autoplay would either be silently
 * muted or refuse to start, so instead the poster frame carries an obvious
 * play button. One tap, and it loops.
 *
 * That click buys two other things: YouTube's player (roughly a megabyte of
 * script) is never downloaded for the many visitors who came to look at cars,
 * and no YouTube cookie is set for anyone who does not press play.
 */
export function LoopingVideo({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  // maxresdefault is the only 16:9 thumbnail big enough for a full-width
  // player, but YouTube does not generate it for every upload. If it 404s we
  // drop to hqdefault, which always exists.
  const [poster, setPoster] = useState(
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
  );

  // `loop` is ignored for a single video unless `playlist` names that same
  // video — YouTube then treats it as a one-item playlist and repeats it.
  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${youtubeId}` +
    `?autoplay=1&loop=1&playlist=${youtubeId}` +
    `&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
      {playing ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title} on repeat`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={poster}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() =>
              setPoster(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`)
            }
          />

          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10 transition group-hover:from-black/70"
          />

          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 pl-1.5 text-2xl text-navy-950 shadow-2xl transition duration-300 group-hover:scale-110 group-hover:bg-white sm:h-20 sm:w-20 sm:text-3xl">
              ▶
            </span>
          </span>

          <span
            aria-hidden
            className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-left"
          >
            <span className="rounded bg-black/60 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              ↻ Loops
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
