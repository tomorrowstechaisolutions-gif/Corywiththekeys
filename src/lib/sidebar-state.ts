"use client";

/**
 * Whether the admin rail is collapsed, kept in this browser only.
 *
 * A tiny external store rather than component state, for the same reason
 * `lib/favorites` is one: `useSyncExternalStore` reads localStorage without a
 * setState inside an effect, so it hydrates cleanly and does not trip the
 * cascading-render rule. The server always reports "expanded", which is what
 * the HTML is rendered with; the real preference arrives on the first client
 * read.
 */

const STORAGE_KEY = "kk.admin.sidebar.collapsed";

let cache: boolean | null = null;
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private windows or blocked site data. Expanded is a fine default.
    return false;
  }
}

export function subscribeSidebar(listener: () => void): () => void {
  listeners.add(listener);

  // Keep two admin tabs in step with each other.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      for (const l of listeners) l();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSidebarCollapsed(): boolean {
  cache ??= read();
  return cache;
}

/** The rail is always drawn expanded on the server. */
export function getServerSidebarCollapsed(): boolean {
  return false;
}

export function toggleSidebar(): void {
  const next = !getSidebarCollapsed();
  cache = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Storage unavailable; the in-memory value still drives this session.
  }

  for (const listener of listeners) listener();
}
