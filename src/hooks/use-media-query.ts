"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Track a CSS media query without a setState-in-effect.
 *
 * Returns false during server render, so anything gated on this is opt-in on
 * the client rather than something that flashes then disappears.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
