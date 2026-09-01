"use client";

import { useSyncExternalStore } from "react";

import {
  getFavorites,
  getServerFavorites,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";

/**
 * Save a vehicle to this browser.
 *
 * Deliberately local-only: asking someone to make an account before they can
 * shortlist a car costs more leads than it saves. When accounts arrive these
 * can be migrated up on first sign-in.
 */
export function FavoriteButton({
  vehicleId,
  label,
}: {
  vehicleId: string;
  label: string;
}) {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getServerFavorites,
  );

  const saved = favorites.includes(vehicleId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(vehicleId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      title={saved ? "Saved" : "Save this vehicle"}
      className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 hover:bg-white"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`h-4 w-4 transition ${saved ? "fill-red-500 stroke-red-500" : "fill-none stroke-navy-900"}`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
