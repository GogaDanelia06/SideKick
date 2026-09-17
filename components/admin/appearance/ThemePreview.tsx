"use client";

import type { Shade, ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PreviewDash } from "./PreviewDash";
import { PreviewSite } from "./PreviewSite";
import { SHADE_ICON, SHADE_LABEL } from "./shades";

const HEADING = "mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted";

/** Miniatures of the site and the dashboard, in the theme on screen. */
export function ThemePreview({ colors, shade }: { colors: ThemeColors; shade: Shade }) {
  const { t } = useLanguage();
  const ShadeIcon = SHADE_ICON[shade];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border2 px-3.5 py-3">
        <h3 className="flex items-center justify-between gap-2 text-[15px] font-semibold">
          {t({ ka: "ასე გამოიყურება", en: "How it looks" })}
          <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-muted">
            <ShadeIcon size={13} />
            {t(SHADE_LABEL[shade])}
          </span>
        </h3>
        <p className="mt-1 text-[12px] leading-snug text-muted">
          {t({
            ka: "მიიტანე მაუსი ფერზე — აქ მოინიშნება, სად გამოიყენება. ნიმუშის ნაწილზე დაჭერა მის ფერს გაჩვენებს.",
            en: "Point at a colour to see where it is used. Click any part here to jump to its colour.",
          })}
        </p>
      </header>

      <div className="flex flex-col gap-3 p-3">
        <div>
          <p className={HEADING}>{t({ ka: "საჯარო საიტი", en: "Public site" })}</p>
          <PreviewSite colors={colors} />
        </div>
        <div>
          <p className={HEADING}>{t({ ka: "დაშბორდი", en: "Dashboard" })}</p>
          <PreviewDash colors={colors} />
        </div>
      </div>
    </div>
  );
}
