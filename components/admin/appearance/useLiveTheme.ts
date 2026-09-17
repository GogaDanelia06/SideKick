"use client";

import { useEffect } from "react";
import { themeCss, type Theme } from "@/lib/site/theme/css";
import type { Shade } from "@/lib/site/theme/tokens";

/**
 * Paints the draft onto the real page. `shade` switches the page to that theme once
 * the admin picks one; until then the page stays in the theme it was opened in.
 * Leaving the editor puts the original theme back.
 */
export function useLiveTheme(draft: Theme, shade: Shade | null) {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "theme-preview";
    style.textContent = themeCss(draft);
    document.head.append(style);
    return () => style.remove();
  }, [draft]);

  // Read before the effect below changes it.
  useEffect(() => {
    const root = document.documentElement;
    const original = root.getAttribute("data-theme");
    return () => {
      if (original) root.setAttribute("data-theme", original);
      else root.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    if (shade) document.documentElement.setAttribute("data-theme", shade);
  }, [shade]);
}

/** Asks before the page is left with unsaved changes. */
export function useLeaveWarning(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);
}
