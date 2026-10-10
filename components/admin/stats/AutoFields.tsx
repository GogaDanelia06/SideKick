"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { FIELD_LABEL, SMALL, type Fields } from "./statForm";

export function AutoFields({ initial }: { initial?: Fields }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-2.5 rounded-[8px] border border-border2 bg-soft p-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={FIELD_LABEL}>{t("admin.stats.editor.startValue")}</span>
          <input
            name="baseValue"
            type="number"
            step="any"
            defaultValue={initial?.baseValue ?? 1000}
            className={SMALL}
          />
        </label>
        <label className="block">
          <span className={FIELD_LABEL}>{t("admin.stats.editor.suffix")}</span>
          <input name="suffix" defaultValue={initial?.suffix} placeholder="₾ / % / +" className={SMALL} />
        </label>
      </div>

      <div>
        <span className={FIELD_LABEL}>
          {t("admin.stats.editor.howMuchItGrows")}
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <input
            name="changeMin"
            type="number"
            step="any"
            defaultValue={initial?.changeMin ?? 1}
            className={SMALL}
          />
          <input
            name="changeMax"
            type="number"
            step="any"
            defaultValue={initial?.changeMax ?? 3}
            className={SMALL}
          />
        </div>
      </div>

      <div>
        <span className={FIELD_LABEL}>
          {t("admin.stats.editor.howOftenInSeconds")}
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <input
            name="intervalMinS"
            type="number"
            min={5}
            defaultValue={Math.round((initial?.intervalMinMs ?? 60_000) / 1000)}
            className={SMALL}
          />
          <input
            name="intervalMaxS"
            type="number"
            min={5}
            defaultValue={Math.round((initial?.intervalMaxMs ?? 300_000) / 1000)}
            className={SMALL}
          />
        </div>
      </div>

      <p className="text-[12px] text-amber">
        {t("admin.stats.editor.savingRestartsTheFigure")}
      </p>
    </div>
  );
}
