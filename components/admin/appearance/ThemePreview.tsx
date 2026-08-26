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
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "საიტი", en: "Public site" })}
        </p>
        <PreviewSite colors={colors} />
      </div>
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "დაშბორდი", en: "Dashboard" })}
        </p>
        <PreviewDash colors={colors} />
      </div>
    </div>
  );
}
