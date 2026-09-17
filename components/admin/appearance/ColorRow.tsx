"use client";

import type { Theme } from "@/lib/site/theme/css";
import { GROUPS, type Shade, type ThemeToken } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ColorInput } from "./ColorInput";
import { SHADE_ICON, SHADE_LABEL, SHADES } from "./shades";

/** One colour with its dark and light values side by side. */
export function ColorRow({
  token,
  draft,
  saved,
  onChange,
  onShade,
}: {
  token: ThemeToken;
  draft: Theme;
  saved: Theme;
  onChange: (shade: Shade, hex: string) => void;
  /** Editing a value shows the screen in that value's theme. */
  onShade: (shade: Shade) => void;
}) {
  const { t } = useLanguage();
  // "Background" and "Lines" exist in two groups, so the group is part of the name.
  const group = GROUPS.find((g) => g.id === token.group);
  const name = group ? `${t(token.label)} (${t(group.label)})` : t(token.label);

  return (
    <div className="grid gap-2 rounded-lg p-1.5 transition-colors hover:bg-soft @lg:grid-cols-[minmax(0,1fr)_auto_auto] @lg:items-center @lg:p-2">
      <div className="min-w-0 px-0.5">
        <div className="text-[13px] font-medium text-ink">{t(token.label)}</div>
        <div className="text-[12px] leading-snug text-muted">{t(token.hint)}</div>
      </div>
      <div className="flex flex-wrap gap-2 @lg:contents">
        {SHADES.map((shade) => {
          const ShadeIcon = SHADE_ICON[shade];
          return (
            <div key={shade} className="flex flex-col gap-1 @lg:contents">
              {/* In a wide section the column headings say which theme this is. */}
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted @lg:hidden">
                <ShadeIcon size={12} />
                {t(SHADE_LABEL[shade])}
              </span>
              <ColorInput
                label={`${name} — ${t(SHADE_LABEL[shade])}`}
                value={draft[shade][token.id]}
                saved={saved[shade][token.id]}
                fallback={token[shade]}
                onChange={(hex) => onChange(shade, hex)}
                onFocus={() => onShade(shade)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
