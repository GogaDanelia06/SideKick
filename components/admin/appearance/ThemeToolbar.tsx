"use client";

import { BACKGROUNDS } from "@/lib/site/backgrounds";
import type { Shade } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TAB = "rounded-[7px] px-3 py-1.5 text-[12px] font-medium transition-colors";

/** Which palette is being edited, and the one-click way into it. */
export function ThemeToolbar({
  shade,
  onShade,
  onPreset,
}: {
  shade: Shade;
  onShade: (shade: Shade) => void;
  onPreset: (colors: Record<string, string>) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-1 rounded-[9px] border border-border bg-card p-1">
        {(["dark", "light"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onShade(s)}
            className={`${TAB} ${s === shade ? "bg-soft text-ink" : "text-muted hover:text-ink"}`}
          >
            {s === "dark"
              ? t({ ka: "მუქი თემა", en: "Dark theme" })
              : t({ ka: "ღია თემა", en: "Light theme" })}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted">{t({ ka: "მზა ფონები:", en: "Ready-made:" })}</span>
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPreset({ bg: b[shade].bg, canvas: b[shade].canvas })}
            title={t(b.label)}
            aria-label={t(b.label)}
            style={{ background: b[shade].bg }}
            className="size-6 rounded-md border border-border hover:ring-1 hover:ring-blue-ring"
          />
        ))}
      </div>
    </div>
  );
}
