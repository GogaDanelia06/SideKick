"use client";

import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";

/** Access the active locale, switchers, and the `t` bilingual resolver. */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
