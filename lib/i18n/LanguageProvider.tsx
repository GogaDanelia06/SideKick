"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./config";
import { textIn, type Text, type Vars } from "./messages";
import type { Locale } from "./types";
import { readStored, writeStored } from "@/lib/browserStorage";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: (value: Text, vars?: Vars) => string;
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
  const stored = readStored(LOCALE_STORAGE_KEY);
  return stored === "ka" || stored === "en" ? stored : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function commit(next: Locale) {
  writeStored(LOCALE_STORAGE_KEY, next);
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
    () => ({ locale, setLocale, toggle, t: (value, vars) => textIn(locale, value, vars) }),
    [locale, setLocale, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
