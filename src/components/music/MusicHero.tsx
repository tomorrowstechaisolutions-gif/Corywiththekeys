"use client";

import Image from "next/image";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * The stage-lit hero.
 *
 * The video only mounts on a wide viewport where motion is welcome. On a
 * phone, or when the visitor has asked for reduced motion, the poster image
 * is the whole story — no 750 KB download for someone on cell data, and no
 * moving background for someone who gets motion sick.
 */
export function MusicHeroMedia() {
  const wide = useMediaQuery("(min-width: 1024px)");
  const stillness = useMediaQuery("(prefers-reduced-motion: reduce)");
  const playVideo = wide && !stillness;

  return (
    <>
      <Image
        src="/brand/music-hero.webp"
        alt="Cory performing under stage lights with a black performance car beside him"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] lg:object-[60%_center]"
      />

      {playVideo ? (
        <video
          // Poster keeps the frame filled until the first video frame lands.
          poster="/brand/music-hero.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[60%_center]"
        >
          <source src="/brand/music-hero.mp4" type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
