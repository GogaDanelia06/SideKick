"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import {
  IconLayoutDashboard,
  IconSparkles,
  IconTypography,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import type { Shade, TokenGroup } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";
import { PICKER_WIDTH, SHADE_ICON, SHADE_LABEL, SHADES } from "./shades";

/** Kept out of tokens.ts, which the root layout imports. */
const ICONS: Record<TokenGroup, Icon> = {
  site: IconWorld,
  dash: IconLayoutDashboard,
  text: IconTypography,
  accent: IconSparkles,
};

export function ThemeSection({
  group,
  title,
  hint,
  count,
  shade,
  children,
}: {
  group: TokenGroup;
  title: Bilingual;
  hint: Bilingual;
  count: number;
  /** The theme on screen; its column heading is emphasised. */
  shade: Shade;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const Glyph = ICONS[group];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-start gap-3 border-b border-border2 p-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-soft text-ink">
          <Glyph size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-baseline gap-2 text-[15px] font-semibold">
            {t(title)}
            <span className="text-[12px] font-normal text-muted">
              {count} {t({ ka: "ფერი", en: count === 1 ? "colour" : "colours" })}
            </span>
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug text-muted">{t(hint)}</p>
        </div>
      </header>

      <div className="p-2">
        <div className="hidden gap-2 px-2 pb-1 pt-1 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <span />
          {SHADES.map((s) => {
            const ShadeIcon = SHADE_ICON[s];
            return (
              <span
                key={s}
                className={clsx(
                  "flex items-center gap-1.5 px-1 text-[12px] font-semibold",
                  PICKER_WIDTH,
                  s === shade ? "text-ink" : "text-muted",
                )}
              >
                <ShadeIcon size={14} />
                {t(SHADE_LABEL[s])}
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </section>
  );
}
