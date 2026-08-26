"use client";

import { PRESETS, presetColors, presetSwatch } from "@/lib/site/theme/presets";
import type { Shade, ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TAB = "rounded-[7px] px-3 py-1.5 text-[12px] font-medium transition-colors";

/** Which palette is being edited, and the one-click ways into it. */
export function ThemeToolbar({
  shade,
  onShade,
  onPreset,
}: {
  shade: Shade;
  onShade: (shade: Shade) => void;
  onPreset: (colors: ThemeColors) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit gap-1 rounded-[9px] border border-border bg-card p-1">
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

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "მზა პალიტრები", en: "Ready-made palettes" })}
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const [bg, surface, accent] = presetSwatch(p, shade);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPreset(presetColors(p, shade))}
                className="flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2.5 text-[12px] hover:border-ink/40"
              >
                <span className="flex overflow-hidden rounded-md border border-border">
                  <span aria-hidden style={{ background: bg }} className="size-6" />
                  <span aria-hidden style={{ background: surface }} className="size-6" />
                  <span aria-hidden style={{ background: accent }} className="size-6" />
                </span>
                {t(p.label)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
