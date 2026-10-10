"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT } from "./seoForm";

export function UrlFields({ path, canonical }: { path: string; canonical: string }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 border-t border-border2 pt-5 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.canonicalUrl")}</span>
        <input name="canonical" defaultValue={canonical} placeholder={path} className={INPUT} />
        <span className="mt-1 block text-[11px] text-faint">{t("admin.seo.editor.blankThePageS")}</span>
      </label>

      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-muted">{t("admin.seo.editor.slugUrl")}</span>
        <input value={path} readOnly disabled className={`${INPUT} opacity-60`} />
        <span className="mt-1 block text-[11px] text-faint">{t("admin.seo.editor.theAddressIsDefined")}</span>
      </label>
    </div>
  );
}
