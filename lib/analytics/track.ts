import type { EventProps } from "./events";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: (command: string, name: string, params?: Record<string, unknown>) => void;
  }
}

/** Sends an event to Google Analytics (when configured) and /api/track; `keepalive` survives navigation. */
export function track(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  // The owner's own admin activity is not traffic.
  if (window.location.pathname.startsWith("/admin")) return;

  window.gtag?.("event", name, props as Record<string, unknown> | undefined);

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {
    // A missed count is not worth surfacing to the visitor.
  });
}
