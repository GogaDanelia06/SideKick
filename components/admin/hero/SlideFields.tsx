"use client";

import { MediaField } from "@/components/admin/ui/MediaField";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, LABEL } from "./heroStyles";
import type { SlideWithStats } from "./types";

export function SlideFields({ initial }: { initial?: SlideWithStats }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <MediaField
        name="mediaUrl"
        typeName="mediaType"
        initialUrl={initial?.mediaUrl}
        initialType={initial?.mediaType}
      />

      <label className="block">
        <span className={LABEL}>
          {t("admin.hero.editor.builtInAnimationShown")}
        </span>
        <select name="mock" defaultValue={initial?.mock ?? ""} className={INPUT}>
          <option value="">{t("admin.hero.editor.none")}</option>
          <option value="chat">{t("admin.hero.editor.chat")}</option>
          <option value="dashboard">{t("admin.hero.editor.dashboard")}</option>
          <option value="tester">{t("admin.hero.editor.tester")}</option>
        </select>
        <p className="mt-1.5 text-[12px] text-faint">
          {t("admin.hero.editor.theRightHandPanel")}
        </p>
      </label>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.badgeGeorgian")}</span>
          <input name="badgeKa" defaultValue={initial?.badgeKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.badgeEnglish")}</span>
          <input name="badgeEn" defaultValue={initial?.badgeEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.titleGeorgian")}</span>
          <input name="titleKa" required defaultValue={initial?.titleKa} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.titleEnglish")}</span>
          <input name="titleEn" required defaultValue={initial?.titleEn} className={INPUT} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.textGeorgian")}</span>
          <textarea name="textKa" defaultValue={initial?.textKa} className={`${INPUT} min-h-[100px]`} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.textEnglish")}</span>
          <textarea name="textEn" defaultValue={initial?.textEn} className={`${INPUT} min-h-[100px]`} />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonGeorgian")}</span>
          <input name="ctaLabelKa" defaultValue={initial?.ctaLabelKa} placeholder={t("admin.hero.editor.learnMore")} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonEnglish")}</span>
          <input name="ctaLabelEn" defaultValue={initial?.ctaLabelEn} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>{t("admin.hero.editor.buttonUrl")}</span>
          <input name="ctaUrl" defaultValue={initial?.ctaUrl ?? "/pricing"} placeholder="/pricing" className={INPUT} />
        </label>
      </div>
    </div>
  );
}
