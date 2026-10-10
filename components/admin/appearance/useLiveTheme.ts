"use client";

import { useEffect } from "react";
import { themeCss, type Theme } from "@/lib/site/theme/css";
import type { Shade } from "@/lib/site/theme/tokens";

export function useLiveTheme(draft: Theme, shade: Shade | null) {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "theme-preview";
    style.textContent = themeCss(draft);
    document.head.append(style);
    return () => style.remove();
  }, [draft]);

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

export function useLeaveWarning(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);
}
