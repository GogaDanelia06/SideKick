"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "./config";
import { chosenTheme, rememberTheme, systemTheme, watchSystemTheme } from "./preference";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const listeners = new Set<() => void>();

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  // Without a pick of their own, visitors follow the system as it changes (e.g. at sunset).
  const stopWatching = watchSystemTheme((theme) => {
    if (!chosenTheme()) apply(theme);
  });
  // A pick made in another tab.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) apply(chosenTheme() ?? systemTheme());
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    stopWatching();
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Theme {
  const current = document.documentElement.dataset.theme;
  return current === "light" || current === "dark" ? current : DEFAULT_THEME;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

function commit(next: Theme) {
  rememberTheme(next);
  apply(next);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => commit(next), []);
  const toggle = useCallback(
    () => commit(getSnapshot() === "dark" ? "light" : "dark"),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
