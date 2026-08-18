"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { track } from "@/lib/analytics/track";

/**
 * Switches between the two languages in one click.
 *
 * The label is the language you would get, not the one you are reading — a
 * button reading "GEO" while the page is already Georgian tells you nothing you
 * could not see, and it was the only control on the site that opened a menu to
 * choose between two options. With exactly two, the menu was the whole cost and
 * none of the benefit.
 *
 * If a third language is ever added this has to become a menu again; the shape
 * below assumes two on purpose rather than by accident.
 */
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
      // Named for what it does, because "ENG" alone is not a sentence to a
      // screen reader — and the visible label is deliberately the *other*
      // language, which would otherwise read as the current one.
      aria-label={`Switch to ${next.label}`}
      title={next.label}
      className="inline-flex h-[34px] items-center rounded-sm border border-border px-[11px] text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary"
    >
      {next.short}
    </button>
  );
}
