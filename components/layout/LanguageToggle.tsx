"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { track } from "@/lib/analytics/track";

/** Toggles between the two languages; the label names the language you would switch to. */
export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const next = LOCALES.find((l) => l.code !== locale) ?? LOCALES[0];

  return (
    <button
      type="button"
      onClick={() => {
        setLocale(next.code);
        track("language_changed");
      }}
      aria-label={`Switch to ${next.label}`}
      title={next.label}
      className="inline-flex h-[34px] items-center rounded-sm border border-border px-[11px] text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary"
    >
      {next.short}
    </button>
  );
}
