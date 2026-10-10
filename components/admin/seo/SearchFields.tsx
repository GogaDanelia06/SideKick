"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { SeoCounter } from "./SeoCounter";
import { INPUT, LIMITS } from "./seoForm";

export function SearchFields({
  title,
  description,
  defaults,
  onTitle,
  onDescription,
}: {
  title: string;
  description: string;
  defaults: { title: string; description: string };
  onTitle: (value: string) => void;
  onDescription: (value: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <>
      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t("admin.seo.editor.title")}
          <SeoCounter length={title.length} max={LIMITS.title} />
        </span>
        <input
          name="title"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder={defaults.title}
          className={INPUT}
        />
        <span className="mt-1 block text-[11px] text-faint">{t("admin.seo.editor.thisAppearsInGoogle")}</span>
      </label>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[12px] font-medium text-muted">
          {t("admin.seo.editor.description")}
          <SeoCounter length={description.length} max={LIMITS.description} />
        </span>
        <textarea
          name="description"
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={defaults.description}
          className={`${INPUT} min-h-[92px]`}
        />
      </label>
    </>
  );
}
