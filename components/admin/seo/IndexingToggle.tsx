"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function IndexingToggle({ indexable, onToggle }: { indexable: boolean; onToggle: () => void }) {
  const { t } = useLanguage();

  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{t("admin.seo.editor.indexing")}</span>
      <input type="hidden" name="indexable" value={indexable ? "1" : "0"} />
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium ${
          indexable ? "border-green bg-green-surface text-green" : "border-amber bg-soft text-amber"
        }`}
      >
        {indexable ? <IconEye size={16} /> : <IconEyeOff size={16} />}
        {indexable ? t("admin.seo.editor.indexVisibleInSearch") : t("admin.seo.editor.noindexHiddenFromSearch")}
      </button>
    </div>
  );
}
