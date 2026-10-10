"use client";

import type { LegalSection } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[11px] uppercase tracking-wide text-faint";

type Fields = Pick<LegalSection, "headingKa" | "headingEn" | "bodyKa" | "bodyEn" | "bulletsKa" | "bulletsEn">;

export function SectionFields({ initial }: { initial?: Fields }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.headingGeorgian")}</span>
          <input name="headingKa" required defaultValue={initial?.headingKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.headingEnglish")}</span>
          <input name="headingEn" required defaultValue={initial?.headingEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.bodyGeorgian")}</span>
          <textarea
            name="bodyKa"
            defaultValue={initial?.bodyKa}
            placeholder={t("admin.legal.editor.separateParagraphsWithA")}
            className={`${INPUT} min-h-[130px]`}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.bodyEnglish")}</span>
          <textarea name="bodyEn" defaultValue={initial?.bodyEn} className={`${INPUT} min-h-[130px]`} />
        </label>
      </div>

      <p className="text-[12px] text-faint">{t("admin.legal.editor.bulletsNote")}</p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.bulletsGeorgian")}</span>
          <textarea
            name="bulletsKa"
            defaultValue={initial?.bulletsKa}
            placeholder={t("admin.legal.editor.oneItemPerLine")}
            className={`${INPUT} min-h-[90px]`}
          />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.legal.editor.bulletsEnglish")}</span>
          <textarea name="bulletsEn" defaultValue={initial?.bulletsEn} className={`${INPUT} min-h-[90px]`} />
        </label>
      </div>
    </div>
  );
}
