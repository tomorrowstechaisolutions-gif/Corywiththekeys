"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryPhoto = { url: string; alt: string };

/**
 * Photo gallery for a listing.
 *
 * Photos are the listing. Buyers scroll them before they read a word, so the
 * main image gets the space and the thumbnails stay visible rather than hiding
 * behind a lightbox — a used car is bought on the fourth photo, not the first.
 *
 * Arrow keys move through the set, because a keyboard user should not have to
 * tab through twenty thumbnails to see the interior.
 */
export function VehicleGallery({
  photos,
  title,
}: {
  photos: GalleryPhoto[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  if (!current) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-medium text-navy-700/60">
        Photos coming soon
      </div>
    );
  }

  const step = (delta: number) =>
    setActive((i) => (i + delta + photos.length) % photos.length);

  return (
    <div>
      <div
        role="group"
        aria-label={`Photos of ${title}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
        }}
        className="relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-keyblue-500"
      >
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy-950/70 text-lg text-white transition hover:bg-navy-950"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy-950/70 text-lg text-white transition hover:bg-navy-950"
            >
              <span aria-hidden>›</span>
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-navy-950/75 px-2.5 py-1 text-xs font-semibold text-white">
              {active + 1} / {photos.length}
            </p>
          </>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Photo ${index + 1} of ${photos.length}`}
                aria-current={active === index}
                className={`relative block aspect-4/3 w-full overflow-hidden rounded-md border transition ${
                  active === index
                    ? "border-keyblue-600 ring-2 ring-keyblue-600/30"
                    : "border-slate-200 hover:border-keyblue-400"
                }`}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
