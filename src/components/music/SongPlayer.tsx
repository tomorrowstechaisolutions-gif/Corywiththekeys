"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { FEATURED_AUDIO, youtubeThumbnail } from "@/data/cory-links";

/** Broadcast when the YouTube player starts, so we never play over it. */
export const VIDEO_PLAY_EVENT = "ck:video-play";

const DISMISSED_KEY = "ck:song-dismissed";

/**
 * The featured song, in a bar pinned to the bottom of the music page.
 *
 * WHAT IT CAN AND CANNOT DO
 * -------------------------
 * It cannot start on page load. Every current browser blocks audible media
 * until the visitor has interacted with the document, and self-hosting the
 * file does not change that — the policy is about sound, not about the file's
 * origin. A muted autoplay would be allowed, which is useless for a song.
 *
 * So it does the next best thing: it asks to play immediately, and when it is
 * refused it waits for the first click, tap or keypress anywhere on the page
 * and starts then. In practice the song begins the moment a visitor does
 * anything at all.
 *
 * Because sound arrives without an explicit press of play, the pause control
 * is always on screen (WCAG 2.1 SC 1.4.2), a pause is remembered for the rest
 * of the session so it never nags, and the bar yields immediately if the
 * visitor starts the music video instead.
 */
export function SongPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { src, title, featuring, youtubeId, startOnFirstInteraction } =
    FEATURED_AUDIO;

  // The audio element is the source of truth for play state — mirroring it
  // rather than guessing keeps the button honest if playback stalls or the OS
  // pauses it from a headset button.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (progressRef.current && el.duration) {
        // Written straight to the DOM: this fires several times a second and
        // does not need to re-render the component.
        progressRef.current.style.width = `${(el.currentTime / el.duration) * 100}%`;
      }
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
    };
  }, []);

  // Try to start, and fall back to the visitor's first interaction.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    let stopped = false;
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === "1") stopped = true;
    } catch {
      // Private mode or blocked storage — treat as not dismissed.
    }
    if (stopped || !startOnFirstInteraction) return;

    const start = () => {
      void el.play().catch(() => {
        // Still refused; the visitor can press play.
      });
    };

    const onFirstInteraction = () => {
      detach();
      start();
    };

    function detach() {
      document.removeEventListener("pointerdown", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    }

    void el
      .play()
      .then(detach)
      .catch(() => {
        // Expected. Wait for a gesture that unlocks audio.
        document.addEventListener("pointerdown", onFirstInteraction, {
          once: true,
        });
        document.addEventListener("keydown", onFirstInteraction, {
          once: true,
        });
      });

    return detach;
  }, [startOnFirstInteraction]);

  // Yield to the music video rather than talking over it.
  useEffect(() => {
    const onVideo = () => audioRef.current?.pause();
    window.addEventListener(VIDEO_PLAY_EVENT, onVideo);
    return () => window.removeEventListener(VIDEO_PLAY_EVENT, onVideo);
  }, []);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
      // A deliberate pause sticks for the session.
      try {
        sessionStorage.setItem(DISMISSED_KEY, "1");
      } catch {
        // Nothing to do — the pause still took effect.
      }
    }
  }

  function close() {
    audioRef.current?.pause();
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore.
    }
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border border-white/15 bg-navy-950/90 p-2.5 pr-3 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-keyblue-600 text-lg text-white transition hover:bg-keyblue-500"
        >
          <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
        </button>

        <div className="relative hidden h-11 w-16 shrink-0 overflow-hidden rounded-md sm:block">
          <Image
            src={youtubeThumbnail(youtubeId)}
            alt=""
            fill
            unoptimized
            sizes="64px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            {title}
            {featuring ? (
              <span className="font-normal text-white/55"> · {featuring}</span>
            ) : null}
          </p>

          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              ref={progressRef}
              className="h-full w-0 rounded-full bg-keyblue-400"
            />
          </div>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
            {playing ? "↻ On repeat" : "Paused"}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Close the player"
          className="shrink-0 rounded p-1.5 text-lg leading-none text-white/45 transition hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden>×</span>
        </button>
      </div>

      <audio ref={audioRef} src={src} loop preload="auto" />
    </div>
  );
}
