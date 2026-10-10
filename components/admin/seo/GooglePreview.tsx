"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

export function GooglePreview({
  title,
  description,
  siteUrl,
  path,
}: {
  title: string;
  description: string;
  siteUrl: string;
  path: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="select-none rounded-[8px] border border-dashed border-border2 bg-soft p-4 opacity-90">
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-faint">
        <span>{t("admin.seo.editor.googlePreview")}</span>
        <span className="normal-case tracking-normal">{t("admin.seo.editor.previewOnly")}</span>
      </div>
      <div className="truncate text-[15px] text-blue">{title}</div>
      <div className="text-[12px] text-green">
        {siteUrl}
        {path === "/" ? "" : path}
      </div>
      <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{description}</div>
      <p className="mt-2.5 border-t border-border2 pt-2 text-[11px] text-faint">
        {t("admin.seo.editor.thisIsWhatGoogle")}
      </p>
    </div>
  );
}
