/**
 * One poller for every live figure on the page.
 *
 * The landing page can show the same counter in the strip and inside a slide,
 * and a carousel with three slides could easily hold six figures. Each one
 * fetching for itself would be six requests every interval for data that is
 * identical, so they share a single store instead: the first figure to mount
 * starts the poll, the last one to unmount stops it.
 *
 * A failed request is ignored rather than surfaced. The number on screen is
 * already correct as of the last successful read, and blanking it because a
 * visitor's wifi dropped for a second would be a worse answer than a slightly
 * old one.
 */

const ENDPOINT = "/api/stats/live";
const REFRESH_MS = 15_000;

type Snapshot = Record<string, number>;

let snapshot: Snapshot = {};
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

async function pull(): Promise<void> {
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) return;
    snapshot = (await res.json()) as Snapshot;
    for (const notify of listeners) notify();
  } catch {
    // Offline or mid-deploy: keep showing the last figures we trust.
  }
}

function visible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

/** Coming back to a parked tab should show today's figure, not this morning's. */
function onVisibility(): void {
  if (visible()) void pull();
}

/** Subscribe in the shape `useSyncExternalStore` expects. */
export function subscribeLiveStats(onChange: () => void): () => void {
  listeners.add(onChange);
  if (listeners.size === 1) {
    void pull();
    timer = setInterval(() => {
      // A backgrounded tab is nobody watching; polling it wastes the visitor's
      // battery and our database for a number no one can see. The listener
      // below catches them up the moment they come back.
      if (visible()) void pull();
    }, REFRESH_MS);
    document.addEventListener("visibilitychange", onVisibility);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}

/** The latest figure for a counter, or undefined before the first read. */
export function getLiveStat(key: string): number | undefined {
  return snapshot[key];
}
