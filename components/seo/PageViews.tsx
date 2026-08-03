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

  useEffect(() => {
    // The owner reading their own control panel is not traffic. Counting it
    // would inflate every figure on the very page they are looking at.
    if (pathname.startsWith("/admin")) return;
    track("page_view");
  }, [pathname]);

  return null;
}
