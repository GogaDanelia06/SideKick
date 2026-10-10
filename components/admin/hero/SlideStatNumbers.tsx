"use client";

import type { HeroSlideStat } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, LABEL } from "./slideStatStyles";

export function SlideStatNumbers({ initial, auto }: { initial?: HeroSlideStat; auto: boolean }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-4">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.startValue")}</span>
          <input
            name="baseValue"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.baseValue ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.changeMin")}</span>
          <input
            name="changeMin"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.changeMin ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.changeMax")}</span>
          <input
            name="changeMax"
            type="number"
            step="any"
            disabled={auto}
            defaultValue={initial?.changeMax ?? 0}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.suffix")}</span>
          <input name="suffix" defaultValue={initial?.suffix} placeholder="₾ / %" className={INPUT} />
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.intervalMinMs")}</span>
          <input
            name="intervalMinMs"
            type="number"
            disabled={auto}
            defaultValue={initial?.intervalMinMs ?? 2000}
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.slideStats.intervalMaxMs")}</span>
          <input
            name="intervalMaxMs"
            type="number"
            disabled={auto}
            defaultValue={initial?.intervalMaxMs ?? 6000}
            className={INPUT}
          />
        </label>
      </div>
    </>
  );
}
