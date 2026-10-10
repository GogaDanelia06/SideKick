"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

export function SeoCounter({ length, max }: { length: number; max: number }) {
  const { t } = useLanguage();

  if (length === 0) return <span className="text-faint">{t("admin.seo.editor.default")}</span>;

  return (
    <span className={length > max ? "text-amber" : "text-faint"}>
      {length} / {max}
    </span>
  );
}
