"use client";

import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** A miniature of the public site, drawn from the draft rather than the saved CSS. */
export function PreviewSite({ colors: c }: { colors: ThemeColors }) {
  const { t } = useLanguage();

  return (
    <div style={{ background: c.bg, borderColor: c.siteBorder }} className="rounded-lg border">
      <div
        style={{ borderColor: c.siteBorder }}
        className="flex items-center justify-between border-b px-3 py-2"
      >
        <span style={{ color: c.ink }} className="text-[10px] font-bold tracking-wide">
          SIDEKICK
        </span>
        <div className="flex items-center gap-2">
          <span style={{ color: c.muted }} className="text-[9px]">
            {t({ ka: "ფასები", en: "Pricing" })}
          </span>
          <span
            style={{ background: c.primary, color: "#ffffff" }}
            className="rounded-md px-2 py-1 text-[9px] font-semibold"
          >
            {t({ ka: "დაწყება", en: "Get started" })}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div style={{ color: c.ink }} className="text-[13px] font-semibold leading-tight">
          {t({ ka: "გაყიდვები ავტომატურად", en: "Sales, automatically" })}
        </div>
        <div style={{ color: c.muted }} className="mt-1 text-[10px] leading-snug">
          {t({
            ka: "აღწერის ტექსტი ორ ხაზზე, ისე როგორც მთავარ გვერდზეა.",
            en: "Body copy over two lines, the way it reads on the home page.",
          })}
        </div>

        <div
          style={{ background: c.card, borderColor: c.siteBorder }}
          className="mt-2.5 rounded-md border p-2.5"
        >
          <div style={{ color: c.ink }} className="text-[10px] font-semibold">
            {t({ ka: "ბარათი", en: "A card" })}
          </div>
          <div
            style={{ borderColor: c.input, color: c.muted }}
            className="mt-1.5 rounded border px-2 py-1 text-[9px]"
          >
            {t({ ka: "ველი", en: "Input field" })}
          </div>
          <div style={{ color: c.blue }} className="mt-1.5 text-[9px] underline">
            {t({ ka: "ბმული", en: "A link" })}
          </div>
        </div>
      </div>
    </div>
  );
}
