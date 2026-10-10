"use client";

import { MediaField } from "@/components/admin/ui/MediaField";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, type SeoValues } from "./seoForm";

const LABEL = "mb-1 block text-[12px] font-medium text-muted";

export function SocialFields({
  values,
  fallbackTitle,
  fallbackDescription,
}: {
  values: SeoValues;
  fallbackTitle: string;
  fallbackDescription: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 border-t border-border2 pt-5">
      <div className="text-[11px] uppercase tracking-wide text-faint">
        {t("admin.seo.editor.socialSharingOpenGraph")}
      </div>

      <label className="block">
        <span className={LABEL}>{t("admin.seo.editor.ogTitle")}</span>
        <input name="ogTitle" defaultValue={values.ogTitle} placeholder={fallbackTitle} className={INPUT} />
      </label>

      <label className="block">
        <span className={LABEL}>{t("admin.seo.editor.ogDescription")}</span>
        <textarea
          name="ogDescription"
          defaultValue={values.ogDescription}
          placeholder={fallbackDescription}
          className={`${INPUT} min-h-[72px]`}
        />
      </label>

      <div>
        <span className={LABEL}>{t("admin.seo.editor.ogImage")}</span>
        <MediaField name="ogImageUrl" typeName="ogImageType" initialUrl={values.ogImageUrl} />
        <span className="mt-1 block text-[11px] text-faint">{t("admin.seo.editor.1200630RecommendedBlank")}</span>
      </div>

      <p className="text-[11px] text-faint">{t("admin.seo.editor.theTwitterCardReuses")}</p>
    </div>
  );
}
