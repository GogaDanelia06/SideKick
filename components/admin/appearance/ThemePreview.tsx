"use client";

import { rgba } from "@/lib/site/theme/derive";
import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * Two miniatures: the public site and the dashboard.
 *
 * Needed because the admin panel only shows you half of what you are editing.
 * Change the site background while standing here and nothing on screen moves —
 * the sidebar and cards around you are the *dashboard* colours. These use inline
 * styles from the draft rather than the CSS variables, so both halves are
 * visible at once, and the miniature for the shade you are not currently viewing
 * still shows the right thing.
 */
export function ThemePreview({ colors }: { colors: ThemeColors }) {
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
    <div className="flex flex-col gap-3">
      {/* Public site */}
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "საიტი", en: "Public site" })}
        </p>
        <div
          style={{ background: colors.bg, borderColor: colors.siteBorder }}
          className="rounded-lg border p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span style={{ color: colors.ink }} className="text-[10px] font-bold tracking-wide">
              SIDEKICK
            </span>
            <span
              style={{ background: colors.primary, color: "#ffffff" }}
              className="rounded-md px-2 py-1 text-[9px] font-semibold"
            >
              {t({ ka: "დაწყება", en: "Get started" })}
            </span>
          </div>
          <div
            style={{ background: colors.card, borderColor: colors.siteBorder }}
            className="rounded-md border p-2.5"
          >
            <div style={{ color: colors.ink }} className="text-[12px] font-semibold">
              {t({ ka: "სათაური", en: "A heading" })}
            </div>
            <div style={{ color: colors.muted }} className="mt-0.5 text-[10px] leading-snug">
              {t({ ka: "აღწერის ტექსტი ორ ხაზზე, როგორც საიტზეა.", en: "Body text over two lines, as on the site." })}
            </div>
            <div style={{ color: colors.blue }} className="mt-1 text-[10px] underline">
              {t({ ka: "ბმული", en: "A link" })}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-faint">
          {t({ ka: "დაშბორდი", en: "Dashboard" })}
        </p>
        <div
          style={{ background: colors.canvas, borderColor: colors.dashBorder }}
          className="flex overflow-hidden rounded-lg border"
        >
          <div
            style={{ background: colors.surface, borderColor: colors.dashBorder }}
            className="flex w-[74px] shrink-0 flex-col gap-1 border-r p-2"
          >
            <span
              style={{ background: colors.soft, color: colors.ink }}
              className="rounded px-1.5 py-1 text-[9px] font-semibold"
            >
              {t({ ka: "მთავარი", en: "Home" })}
            </span>
            <span style={{ color: colors.muted }} className="px-1.5 text-[9px]">
              {t({ ka: "ჩატები", en: "Chats" })}
            </span>
            <span style={{ color: colors.muted }} className="px-1.5 text-[9px]">
              {t({ ka: "პროდუქტი", en: "Products" })}
            </span>
          </div>
          <div className="min-w-0 flex-1 p-2">
            <div
              style={{ background: colors.surface, borderColor: colors.dashBorder }}
              className="rounded-md border p-2"
            >
              <div className="flex flex-wrap gap-1">
                {chip(colors.green, t({ ka: "აქტიური", en: "Active" }))}
                {chip(colors.amber, t({ ka: "მოლოდინი", en: "Pending" }))}
                {chip(colors.red, t({ ka: "შეცდომა", en: "Error" }))}
                {chip(colors.ai, "AI")}
              </div>
              <div style={{ borderColor: colors.border2 }} className="mt-2 border-t pt-1.5">
                <span style={{ color: colors.faint }} className="text-[9px]">
                  {t({ ka: "მინიშნების ტექსტი", en: "Hint text" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
