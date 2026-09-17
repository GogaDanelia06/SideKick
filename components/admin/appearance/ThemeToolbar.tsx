"use client";

import clsx from "clsx";
import { PRESETS, presetSwatch, type Preset } from "@/lib/site/theme/presets";
import type { Shade } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SHADE_ICON, SHADE_LABEL, SHADES } from "./shades";

const HEADING = "mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted";

/** Which theme is on screen, and the one-click palettes. */
export function ThemeToolbar({
  shade,
  onShade,
  onPreset,
}: {
  shade: Shade;
  onShade: (shade: Shade) => void;
  onPreset: (preset: Preset) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-3.5">
      <div>
        <p className={HEADING}>{t({ ka: "ეკრანზე ჩანს", en: "On screen" })}</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit gap-1 rounded-[9px] border border-border bg-soft p-1">
            {SHADES.map((s) => {
              const ShadeIcon = SHADE_ICON[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onShade(s)}
                  aria-pressed={s === shade}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                    s === shade ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  <ShadeIcon size={15} />
                  {t(SHADE_LABEL[s])}
                </button>
              );
            })}
          </div>
          <span className="text-[12px] text-muted">
            {t({
              ka: "ფერის შეცვლისას ეკრანი თვითონ ის თემაზე გადაირთვება.",
              en: "Editing a colour switches the screen to its theme.",
            })}
          </span>
        </div>
      </div>

      <div>
        <p className={HEADING}>
          {t({ ka: "მზა პალიტრები — ორივე თემას ერთად ცვლის", en: "Ready-made palettes — set both themes at once" })}
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPreset(p)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-2.5 text-[13px] text-ink hover:border-blue"
            >
              <span className="flex overflow-hidden rounded-md border border-border">
                {presetSwatch(p, shade).map((hex, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{ background: hex }}
                    className="size-6 shadow-[inset_0_0_0_1px_rgba(128,128,128,0.35)]"
                  />
                ))}
              </span>
              {t(p.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
