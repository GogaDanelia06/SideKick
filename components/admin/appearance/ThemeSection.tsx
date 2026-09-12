"use client";

import type { ReactNode } from "react";
import {
  IconLayoutDashboard,
  IconSparkles,
  IconTypography,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import type { TokenGroup } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

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
  children,
}: {
  group: TokenGroup;
  title: Bilingual;
  hint: Bilingual;
  count: number;
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
            <span className="text-[11px] font-normal text-faint">
              {count} {t({ ka: "ფერი", en: count === 1 ? "colour" : "colours" })}
            </span>
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug text-muted">{t(hint)}</p>
        </div>
      </header>
      <div className="grid gap-2 p-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
