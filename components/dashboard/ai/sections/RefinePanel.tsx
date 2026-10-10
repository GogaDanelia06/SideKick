"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

export function RefinePanel({
  instructions,
  onInstructions,
  blocked,
  dirty,
  pending,
  onRewrite,
}: {
  instructions: string;
  onInstructions: (text: string) => void;
  blocked: boolean;
  dirty: boolean;
  pending: boolean;
  onRewrite: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={2}
        value={instructions}
        onChange={(e) => onInstructions(e.target.value)}
        placeholder={t("dashboard.ai.promptAiActions.eGAnswerMore")}
        className="w-full rounded-[8px] border border-border bg-transparent p-2.5 text-[13px]"
      />
      {dirty ? <p className="text-[13px] text-amber">{t("dashboard.ai.promptAiActions.saveFirst")}</p> : null}
      <button
        type="button"
        disabled={blocked || dirty || !instructions.trim()}
        onClick={onRewrite}
        className="inline-flex h-10 items-center gap-2 self-start rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
      >
        {pending ? t("dashboard.ai.promptAiActions.working") : t("dashboard.ai.promptAiActions.rewrite")}
      </button>
    </div>
  );
}
