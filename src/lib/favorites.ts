"use client";

/**
 * Saved vehicles, kept in this browser only.
 *
 * A tiny external store rather than per-component state, for two reasons:
 * every heart on the page stays in sync when one is clicked, and
 * `useSyncExternalStore` reads it without a setState-in-effect, which
 * hydrates cleanly and satisfies React's rules of effects.
 */

const STORAGE_KEY = "kk.favorites";

const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed.filter((v) => typeof v === "string") as string[]) : EMPTY;
  } catch {
    // Private windows, blocked site data, or corrupt JSON.
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);

  // Keep tabs in step with each other.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Must return a referentially stable value between changes. */
export function getFavorites(): readonly string[] {
  cache ??= read();
  return cache;
}

/** No favourites exist during server render. */
export function getServerFavorites(): readonly string[] {
  return EMPTY;
}

export function toggleFavorite(vehicleId: string): void {
  const current = getFavorites();
  const next = current.includes(vehicleId)
    ? current.filter((id) => id !== vehicleId)
    : [...current, vehicleId];

  cache = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is unavailable; the in-memory cache still drives this session.
  }

  emit();
}
