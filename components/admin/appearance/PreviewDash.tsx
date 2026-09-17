"use client";

import { readableOn, rgba } from "@/lib/site/theme/derive";
import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { Spot } from "./previewFocus";

/** A miniature of the dashboard: menu with the Tester button, a card, statuses and the AI parts. */
export function PreviewDash({ colors: c }: { colors: ThemeColors }) {
  const { t } = useLanguage();
  const label = "px-2 py-0.5 text-[11px]";

  const chip = (token: string, text: string) => (
    <Spot
      tokens={[token]}
      style={{ background: rgba(c[token], 0.15), color: c[token], borderColor: rgba(c[token], 0.35) }}
      className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
    >
      {text}
    </Spot>
  );

  return (
    <Spot as="div" tokens={["canvas"]} style={{ background: c.canvas }} className="flex overflow-hidden rounded-lg">
      <Spot
        as="div"
        tokens={["surface", "dashBorder"]}
        style={{ background: c.surface, borderColor: c.dashBorder }}
        className="flex w-[96px] shrink-0 flex-col gap-1 border-r p-2"
      >
        <Spot tokens={["soft", "ink"]} style={{ background: c.soft, color: c.ink }} className={`${label} rounded-md font-semibold`}>
          {t({ ka: "მთავარი", en: "Home" })}
        </Spot>
        <Spot tokens={["muted"]} style={{ color: c.muted }} className={label}>
          {t({ ka: "ჩატები", en: "Chats" })}
        </Spot>
        <Spot tokens={["muted"]} style={{ color: c.muted }} className={label}>
          {t({ ka: "პროდუქტი", en: "Products" })}
        </Spot>
        <Spot
          tokens={["ai"]}
          style={{ background: c.ai, color: readableOn(c.ai) }}
          className={`${label} mt-auto rounded-md text-center font-semibold`}
        >
          {t({ ka: "ტესტერი", en: "Tester" })}
        </Spot>
      </Spot>

      <div className="min-w-0 flex-1 p-2">
        <Spot
          as="div"
          tokens={["surface", "dashBorder"]}
          style={{ background: c.surface, borderColor: c.dashBorder }}
          className="rounded-md border p-2.5"
        >
          <div className="flex items-baseline justify-between">
            <Spot tokens={["ink"]} style={{ color: c.ink }} className="text-[16px] font-semibold">
              1,284
            </Spot>
            <Spot tokens={["green"]} style={{ color: c.green }} className="text-[11px] font-semibold">
              +12%
            </Spot>
          </div>
          <Spot tokens={["faint"]} style={{ color: c.faint }} className="text-[11px]">
            {t({ ka: "შეტყობინება", en: "Messages" })}
          </Spot>

          <div className="mt-2 flex flex-wrap gap-1">
            {chip("green", t({ ka: "აქტიური", en: "Active" }))}
            {chip("amber", t({ ka: "მოლოდინი", en: "Pending" }))}
            {chip("red", t({ ka: "შეცდომა", en: "Error" }))}
          </div>

          <Spot as="div" tokens={["border2"]} style={{ borderColor: c.border2 }} className="mt-2 border-t pt-2">
            <Spot
              as="div"
              tokens={["ai"]}
              style={{ background: rgba(c.ai, 0.13), borderColor: c.ai, color: c.ai }}
              className="rounded-md border px-2 py-1.5 text-[11px]"
            >
              <span className="font-semibold">AI · </span>
              {t({ ka: "პასუხი მომზადდა", en: "Reply drafted" })}
            </Spot>
          </Spot>

          <div className="mt-2 flex items-center gap-2">
            <Spot
              tokens={["primary"]}
              style={{ background: c.primary, color: "#ffffff" }}
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
            >
              {t({ ka: "შენახვა", en: "Save" })}
            </Spot>
            <Spot tokens={["blue"]} style={{ color: c.blue }} className="text-[11px] underline">
              {t({ ka: "დეტალები", en: "Details" })}
            </Spot>
            <Spot tokens={["ai"]} style={{ background: c.ai }} className="relative ml-auto h-3.5 w-6 rounded-full">
              <span
                style={{ background: readableOn(c.ai) }}
                className="absolute right-0.5 top-0.5 size-2.5 rounded-full"
              />
            </Spot>
          </div>
        </Spot>
      </div>
    </Spot>
  );
}
