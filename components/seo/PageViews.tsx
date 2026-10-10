"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

export function PageViews() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
  }, [pathname]);

  return null;
}
