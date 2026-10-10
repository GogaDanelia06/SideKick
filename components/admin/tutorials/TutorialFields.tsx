"use client";

import type { Tutorial } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const AREA =
  "min-h-[64px] w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

export function TutorialFields({ initial }: { initial?: Tutorial }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2.5">
      <input
        name="youtubeUrl"
        required
        defaultValue={initial?.youtubeUrl}
        placeholder="https://www.youtube.com/watch?v=…"
        className={INPUT}
      />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input name="titleKa" required defaultValue={initial?.titleKa} placeholder={t("admin.tutorials.editor.titleKa")} className={INPUT} />
        <input name="titleEn" defaultValue={initial?.titleEn} placeholder={t("admin.tutorials.editor.titleEn")} className={INPUT} />
        <textarea name="descKa" defaultValue={initial?.descKa} placeholder={t("admin.tutorials.editor.descriptionKa")} className={AREA} />
        <textarea name="descEn" defaultValue={initial?.descEn} placeholder={t("admin.tutorials.editor.descriptionEn")} className={AREA} />
        <input name="categoryKa" defaultValue={initial?.categoryKa} placeholder={t("admin.tutorials.editor.categoryKa")} className={INPUT} />
        <input name="categoryEn" defaultValue={initial?.categoryEn} placeholder={t("admin.tutorials.editor.categoryEn")} className={INPUT} />
      </div>
    </div>
  );
}
