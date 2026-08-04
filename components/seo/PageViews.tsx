"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

/**
 * Counts a page view on first load and on every client-side navigation.
 *
 * The App Router does not reload the document when moving between pages, so
 * without this only the first page of a visit would ever be counted — which is
 * exactly the number the admin panel is being asked for.
 */
export function PageViews() {
  const pathname = usePathname();

  // Admin pages are excluded inside `track` itself, so every event obeys the
  // same rule rather than each caller remembering it.
  useEffect(() => {
    track("page_view");
  }, [pathname]);

  return null;
}
