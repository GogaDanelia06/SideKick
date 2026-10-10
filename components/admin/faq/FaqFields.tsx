"use client";

import type { SiteFaq } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const AREA =
  "min-h-[76px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

type Fields = Pick<SiteFaq, "questionKa" | "questionEn" | "answerKa" | "answerEn">;

export function FaqFields({ initial }: { initial?: Fields }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <input name="questionKa" required defaultValue={initial?.questionKa} placeholder={t("admin.faq.editor.questionKa")} className={INPUT} />
      <input name="questionEn" required defaultValue={initial?.questionEn} placeholder={t("admin.faq.editor.questionEn")} className={INPUT} />
      <textarea name="answerKa" required defaultValue={initial?.answerKa} placeholder={t("admin.faq.editor.answerKa")} className={AREA} />
      <textarea name="answerEn" required defaultValue={initial?.answerEn} placeholder={t("admin.faq.editor.answerEn")} className={AREA} />
    </div>
  );
}
