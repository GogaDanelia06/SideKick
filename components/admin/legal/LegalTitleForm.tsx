"use client";

import { useState } from "react";
import { saveLegalTitle } from "@/lib/admin/actions/legal";
import type { Run } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TITLE_INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

export function LegalTitleForm({
  doc,
  title,
  defaultTitle,
  run,
  pending,
}: {
  doc: string;
  title: { ka: string; en: string };
  defaultTitle: string;
  run: Run;
  pending: boolean;
}) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      action={(fd) => run(() => saveLegalTitle(doc, fd), flashSaved)}
      className="rounded-lg border border-border bg-card p-4"
    >
      <span className="mb-1.5 block text-[12px] font-medium text-muted">
        {t("admin.legal.editor.documentHeadingH1")}
      </span>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input name="titleKa" defaultValue={title.ka} placeholder={defaultTitle} className={TITLE_INPUT} />
        <input
          name="titleEn"
          defaultValue={title.en}
          placeholder={t("admin.legal.editor.inEnglish")}
          className={TITLE_INPUT}
        />
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        {saved ? <span className="text-[13px] text-green">{t("admin.legal.editor.saved")}</span> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
        >
          {pending ? "…" : t("admin.legal.editor.save")}
        </button>
      </div>
    </form>
  );
}
