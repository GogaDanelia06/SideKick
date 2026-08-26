"use client";

import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PreviewDash } from "./PreviewDash";
import { PreviewSite } from "./PreviewSite";

/**
 * Two miniatures, drawn with inline styles from the draft.
 *
 * Needed because the admin panel only shows you half of what you are editing.
 * Change the site background while standing here and nothing on screen moves —
 * the sidebar and cards around you are the *dashboard* colours. Inline styles
 * rather than the CSS variables, so both halves are visible at once and the one
 * for the shade you are not currently viewing still shows the right thing.
 */
export function ThemePreview({ colors }: { colors: ThemeColors }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border2 px-3.5 py-3">
        <h3 className="text-[15px] font-semibold">{t({ ka: "ასე გამოიყურება", en: "How it looks" })}</h3>
        <p className="mt-0.5 text-[12px] leading-snug text-muted">
          {t({
            ka: "საიტს ვერ ხედავ აქედან — ამიტომ ორივეს პატარა ვერსიაა.",
            en: "You cannot see the site from in here, so both are shown small.",
          })}
        </p>
      </header>

      <div className="flex flex-col gap-3 p-3">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
            {t({ ka: "საჯარო საიტი", en: "Public site" })}
          </p>
          <PreviewSite colors={colors} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
            {t({ ka: "დაშბორდი", en: "Dashboard" })}
          </p>
          <PreviewDash colors={colors} />
        </div>
      </div>
    </div>
  );
}
