"use client";

import { rgba } from "@/lib/site/theme/derive";
import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** A miniature of the dashboard: sidebar, a card, status chips, an AI reply. */
export function PreviewDash({ colors: c }: { colors: ThemeColors }) {
  const { t } = useLanguage();

  const chip = (color: string, label: string) => (
    <span
      key={label}
      style={{ background: rgba(color, 0.15), color, borderColor: rgba(color, 0.35) }}
      className="rounded-full border px-1.5 py-px text-[9px] font-semibold"
    >
      {label}
    </span>
  );

  return (
    <div
      style={{ background: c.canvas, borderColor: c.dashBorder }}
      className="flex overflow-hidden rounded-lg border"
    >
      <div
        style={{ background: c.surface, borderColor: c.dashBorder }}
        className="flex w-[78px] shrink-0 flex-col gap-1 border-r p-2"
      >
        <span
          style={{ background: c.soft, color: c.ink }}
          className="rounded px-1.5 py-1 text-[9px] font-semibold"
        >
          {t({ ka: "მთავარი", en: "Home" })}
        </span>
        <span style={{ color: c.muted }} className="px-1.5 py-0.5 text-[9px]">
          {t({ ka: "ჩატები", en: "Chats" })}
        </span>
        <span style={{ color: c.muted }} className="px-1.5 py-0.5 text-[9px]">
          {t({ ka: "პროდუქტი", en: "Products" })}
        </span>
      </div>

      <div className="min-w-0 flex-1 p-2">
        <div
          style={{ background: c.surface, borderColor: c.dashBorder }}
          className="rounded-md border p-2"
        >
          <div className="flex items-baseline justify-between">
            <span style={{ color: c.ink }} className="text-[14px] font-semibold">
              1,284
            </span>
            <span style={{ color: c.green }} className="text-[9px] font-semibold">
              +12%
            </span>
          </div>
          <span style={{ color: c.faint }} className="text-[9px]">
            {t({ ka: "შეტყობინება", en: "Messages" })}
          </span>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {chip(c.green, t({ ka: "აქტიური", en: "Active" }))}
            {chip(c.amber, t({ ka: "მოლოდინი", en: "Pending" }))}
            {chip(c.red, t({ ka: "შეცდომა", en: "Error" }))}
          </div>

          <div style={{ borderColor: c.border2 }} className="mt-2 border-t pt-1.5">
            <div
              style={{ background: rgba(c.ai, 0.13), borderColor: rgba(c.ai, 0.3), color: c.ink }}
              className="rounded-md border px-1.5 py-1 text-[9px]"
            >
              <span style={{ color: c.ai }} className="font-semibold">
                AI ·{" "}
              </span>
              {t({ ka: "პასუხი მომზადდა", en: "Reply drafted" })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
