import type { EventProps } from "./events";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: (command: string, name: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Reports one event to both places at once.
 *
 * Google Analytics gets the full event with its properties, for whoever does
 * the marketing analysis. Our own endpoint gets just the name and the page,
 * which is what the admin panel reads — so the figures in the panel keep
 * working even if nobody ever configures Google.
 *
 * `keepalive` matters: several of these fire on a click that navigates away,
 * and without it the browser cancels the request mid-flight.
 */
export function track(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  // The owner working in their own control panel is not marketing traffic.
  // Their language and theme clicks would otherwise inflate the very figures
  // they are about to read on the analytics screen.
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
