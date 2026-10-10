"use client";

import { useState } from "react";
import clsx from "clsx";
import { ICON_NAMES, resolveIcon } from "@/lib/content/icons";
import { useLanguage } from "@/lib/i18n/useLanguage";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[11px] uppercase tracking-wide text-faint";

export type BoxItem = {
  id: string;
  order: number;
  published: boolean;
  icon: string;
  titleKa: string;
  titleEn: string;
  bodyKa: string;
  bodyEn: string;
};

function IconPicker({ initial }: { initial?: string }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(initial ?? "IconSparkles");

  return (
    <div>
      <span className={LABEL}>{t("admin.boxes.editor.icon")}</span>
      <input type="hidden" name="icon" value={selected} />
      <div className="flex flex-wrap gap-1.5 rounded-[8px] border border-input bg-canvas p-2">
        {ICON_NAMES.map((name) => {
          const Ico = resolveIcon(name);
          const on = selected === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-pressed={on}
              onClick={() => setSelected(name)}
              className={clsx(
                "grid size-9 place-items-center rounded-[7px] border transition-colors",
                on ? "border-blue bg-blue-surface text-blue" : "border-border text-muted hover:text-ink",
              )}
            >
              <Ico size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BoxFields({ initial }: { initial?: BoxItem }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <IconPicker initial={initial?.icon} />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.boxes.editor.titleGeorgian")}</span>
          <input name="titleKa" required defaultValue={initial?.titleKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.boxes.editor.titleEnglish")}</span>
          <input name="titleEn" required defaultValue={initial?.titleEn} className={INPUT} />
        </label>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.boxes.editor.descriptionGeorgian")}</span>
          <textarea name="bodyKa" defaultValue={initial?.bodyKa} className={`${INPUT} min-h-[100px]`} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.boxes.editor.descriptionEnglish")}</span>
          <textarea name="bodyEn" defaultValue={initial?.bodyEn} className={`${INPUT} min-h-[100px]`} />
        </label>
      </div>
    </div>
  );
}
