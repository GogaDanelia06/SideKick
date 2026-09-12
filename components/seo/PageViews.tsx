"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

/** Counts a page view on load and on every client-side navigation. */
export function PageViews() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
  }, [pathname]);

  return null;
}
