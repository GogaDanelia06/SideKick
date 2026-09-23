"use client";

import { useEffect } from "react";

/** While something is unsaved, the browser asks before the page is closed or left behind. */
export function useUnsavedChanges(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    const ask = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  }, [unsaved]);
}
