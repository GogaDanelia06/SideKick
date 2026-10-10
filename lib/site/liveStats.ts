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
  } catch {}
}

function visible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

function onVisibility(): void {
  if (visible()) void pull();
}

export function subscribeLiveStats(onChange: () => void): () => void {
  listeners.add(onChange);
  if (listeners.size === 1) {
    void pull();
    timer = setInterval(() => {
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

export function getLiveStat(key: string): number | undefined {
  return snapshot[key];
}
