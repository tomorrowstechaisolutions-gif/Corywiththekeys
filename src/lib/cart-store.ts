import { PRODUCTS } from "@/data/shop";

export type CartLine = {
  /** productSlug|size|color — one line per variant. */
  id: string;
  slug: string;
  size: string;
  color: string;
  quantity: number;
};

export type CartSnapshot = {
  lines: CartLine[];
  ready: boolean;
  isOpen: boolean;
};

const STORAGE_KEY = "ck:cart:v1";

/**
 * The cart lives outside React.
 *
 * React 19 rightly objects to hydrating state inside an effect — it causes a
 * second render pass on every mount. An external store read through
 * `useSyncExternalStore` reads localStorage once, before the first paint that
 * needs it, and every component subscribed sees the same cart without a
 * provider tree.
 */
let state: CartSnapshot = { lines: [], ready: false, isOpen: false };

/** Stable object for SSR so the server and first client render agree. */
const SERVER_SNAPSHOT: CartSnapshot = {
  lines: [],
  ready: false,
  isOpen: false,
};

const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function set(next: Partial<CartSnapshot>) {
  state = { ...state, ...next };
  emit();
}

function lineId(slug: string, size: string, color: string) {
  return `${slug}|${size}|${color}`;
}

/** Drops anything that no longer matches a real product, size or colour. */
function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { slug, size, color, quantity } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || typeof size !== "string") continue;
    if (typeof color !== "string" || typeof quantity !== "number") continue;
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product) continue;
    if (!product.sizes.includes(size)) continue;
    if (!product.colors.some((c) => c.name === color)) continue;
    out.push({
      id: lineId(slug, size, color),
      slug,
      size,
      color,
      quantity: Math.max(1, Math.min(99, Math.floor(quantity))),
    });
  }
  return out;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  } catch {
    // Private mode or blocked storage — the cart still works for this visit.
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  let lines: CartLine[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) lines = sanitize(JSON.parse(raw));
  } catch {
    // Corrupt value — start empty rather than throwing on every render.
  }
  state = { ...state, lines, ready: true };
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CartSnapshot {
  return state;
}

export function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function addLine(
  slug: string,
  size: string,
  color: string,
  quantity = 1,
) {
  const id = lineId(slug, size, color);
  const existing = state.lines.find((l) => l.id === id);
  const lines = existing
    ? state.lines.map((l) =>
        l.id === id
          ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
          : l,
      )
    : [...state.lines, { id, slug, size, color, quantity }];
  set({ lines, isOpen: true });
  persist();
}

export function setLineQuantity(id: string, quantity: number) {
  const lines =
    quantity <= 0
      ? state.lines.filter((l) => l.id !== id)
      : state.lines.map((l) =>
          l.id === id ? { ...l, quantity: Math.min(99, quantity) } : l,
        );
  set({ lines });
  persist();
}

export function removeLine(id: string) {
  set({ lines: state.lines.filter((l) => l.id !== id) });
  persist();
}

export function clearCart() {
  set({ lines: [] });
  persist();
}

export function openCart() {
  set({ isOpen: true });
}

export function closeCart() {
  set({ isOpen: false });
}
