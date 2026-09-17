"use client";

import type { ThemeColors } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { Spot } from "./previewFocus";

/** A miniature of the public site, drawn from the draft rather than the saved CSS. */
export function PreviewSite({ colors: c }: { colors: ThemeColors }) {
  const { t } = useLanguage();

  return (
    <Spot
      as="div"
      tokens={["bg", "siteBorder"]}
      style={{ background: c.bg, borderColor: c.siteBorder }}
      className="block rounded-lg border"
    >
      <Spot
        as="div"
        tokens={["siteBorder"]}
        style={{ borderColor: c.siteBorder }}
        className="flex items-center justify-between border-b px-3 py-2"
      >
        <Spot tokens={["ink"]} style={{ color: c.ink }} className="text-[12px] font-bold tracking-wide">
          SIDEKICK
        </Spot>
        <span className="flex items-center gap-2.5">
          <Spot tokens={["muted"]} style={{ color: c.muted }} className="text-[11px]">
            {t({ ka: "ფასები", en: "Pricing" })}
          </Spot>
          <Spot
            tokens={["primary"]}
            style={{ background: c.primary, color: "#ffffff" }}
            className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
          >
            {t({ ka: "დაწყება", en: "Get started" })}
          </Spot>
        </span>
      </Spot>

      <div className="p-3">
        <Spot as="div" tokens={["ink"]} style={{ color: c.ink }} className="text-[15px] font-semibold leading-tight">
          {t({ ka: "გაყიდვები ავტომატურად", en: "Sales, automatically" })}
        </Spot>
        <Spot as="div" tokens={["muted"]} style={{ color: c.muted }} className="mt-1 text-[12px] leading-snug">
          {t({
            ka: "აღწერის ტექსტი ორ ხაზზე, ისე როგორც მთავარ გვერდზეა.",
            en: "Body copy over two lines, the way it reads on the home page.",
          })}
        </Spot>

        <Spot
          as="div"
          tokens={["card", "siteBorder"]}
          style={{ background: c.card, borderColor: c.siteBorder }}
          className="mt-2.5 rounded-md border p-2.5"
        >
          <Spot as="div" tokens={["ink"]} style={{ color: c.ink }} className="text-[12px] font-semibold">
            {t({ ka: "ბარათი", en: "A card" })}
          </Spot>
          <Spot
            as="div"
            tokens={["input", "muted"]}
            style={{ borderColor: c.input, color: c.muted }}
            className="mt-1.5 rounded border px-2 py-1 text-[11px]"
          >
            {t({ ka: "ველი", en: "Input field" })}
          </Spot>
          <Spot tokens={["blue"]} style={{ color: c.blue }} className="mt-1.5 inline-block text-[11px] underline">
            {t({ ka: "ბმული", en: "A link" })}
          </Spot>
        </Spot>
      </div>
    </Spot>
  );
}
