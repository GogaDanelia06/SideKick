"use client";

import { useState } from "react";
import type { HeroSlideStat } from "@prisma/client";
import { IconBolt } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { SlideStatNumbers } from "./SlideStatNumbers";
import { INPUT, LABEL } from "./slideStatStyles";

export function SlideStatFields({
  initial,
  sources,
}: {
  initial?: HeroSlideStat;
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const [source, setSource] = useState(initial?.source ?? "");
  const auto = source !== "";
  const picked = sources.find((s) => s.key === source);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.labelGeorgian")}</span>
          <input name="labelKa" required defaultValue={initial?.labelKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.labelEnglish")}</span>
          <input name="labelEn" required defaultValue={initial?.labelEn} className={INPUT} />
        </label>
      </div>

      <label className="block">
        <span className={LABEL}>{t("admin.hero.slideStats.whereTheFigureComes")}</span>
        <select
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={INPUT}
        >
          <option value="">{t("admin.hero.slideStats.byHandADrifting")}</option>
          {sources.map((s) => (
            <option key={s.key} value={s.key}>
              {t(s.label)} — {s.value}
            </option>
          ))}
        </select>
      </label>

      {auto ? (
        <p className="flex items-start gap-1.5 rounded-[6px] bg-green-surface/40 px-2.5 py-2 text-[12px] text-green">
          <IconBolt size={14} className="mt-[1px] shrink-0" />
          {t("admin.hero.slideStats.rightNow", { value: picked?.value ?? "—" })}
        </p>
      ) : (
        <p className="rounded-[6px] bg-soft px-2.5 py-2 text-[12px] text-muted">
          {t("admin.hero.slideStats.aHandMadeFigure")}
        </p>
      )}

      <SlideStatNumbers initial={initial} auto={auto} />
    </div>
  );
}
