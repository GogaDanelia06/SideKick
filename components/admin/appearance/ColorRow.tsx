"use client";

import clsx from "clsx";
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
  active,
  onPoint,
  onChange,
  onShade,
}: {
  token: ThemeToken;
  draft: Theme;
  saved: Theme;
  /** Pointed at here or picked in the preview. */
  active: boolean;
  onPoint: (tokenId: string | null) => void;
  onChange: (shade: Shade, hex: string) => void;
  /** Editing a value shows the screen in that value's theme. */
  onShade: (shade: Shade) => void;
}) {
  const { t } = useLanguage();
  // "Background" and "Lines" exist in two groups, so the group is part of the name.
  const group = GROUPS.find((g) => g.id === token.group);
  const name = group ? `${t(token.label)} (${t(group.label)})` : t(token.label);

  return (
    <div
      id={`color-${token.id}`}
      onMouseEnter={() => onPoint(token.id)}
      onMouseLeave={() => onPoint(null)}
      onFocus={() => onPoint(token.id)}
      className={clsx(
        "grid scroll-mt-24 gap-2 rounded-lg border p-1.5 transition-colors @lg:grid-cols-[minmax(0,1fr)_auto_auto] @lg:items-center @lg:p-2",
        active ? "border-[#f59e0b] bg-soft" : "border-transparent",
      )}
    >
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
