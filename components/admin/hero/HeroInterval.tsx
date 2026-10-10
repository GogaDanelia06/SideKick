"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { updateHeroInterval } from "@/lib/admin/actions/hero";
import type { Run } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT, LABEL } from "./heroStyles";

export function HeroInterval({ seconds, pending, run }: { seconds: number; pending: boolean; run: Run }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={(fd) =>
        run(() => updateHeroInterval(fd), () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        })
      }
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
    >
      <label className="block">
        <span className={LABEL}>{t("admin.hero.editor.autoAdvanceSeconds")}</span>
        <input name="seconds" type="number" min={1} max={60} defaultValue={seconds} className={`${INPUT} w-32`} />
      </label>
      <button type="submit" disabled={pending} className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">
        {pending ? "…" : t("admin.hero.editor.save")}
      </button>
      {saved ? (
        <span className="inline-flex items-center gap-1 text-[13px] text-green">
          <IconCheck size={15} /> {t("admin.hero.editor.saved")}
        </span>
      ) : null}
    </form>
  );
}
