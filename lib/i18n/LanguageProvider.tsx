"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./config";
import type { Bilingual, Locale } from "./types";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  /** Resolve a colocated bilingual value to the active locale. */
  t: <T>(value: Bilingual<T>) => T;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "ka" || stored === "en") return stored;
  } catch {}
  return DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function commit(next: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {}
  listeners.forEach((notify) => notify());
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => commit(next), []);
  const toggle = useCallback(
    () => commit(getSnapshot() === "ka" ? "en" : "ka"),
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggle, t: (v) => v[locale] }),
    [locale, setLocale, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
