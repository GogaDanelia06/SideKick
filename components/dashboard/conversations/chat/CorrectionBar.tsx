"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function CorrectionBar({ count, onCancel, onNext }: { count: number; onCancel: () => void; onNext: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-t border-border2 p-3">
      <span className="text-[13px] text-muted">
        {count > 0
          ? t("dashboard.conversations.correction.selected", { count })
          : t("dashboard.conversations.correction.pickHint")}
      </span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-[38px] rounded-[6px] border border-border px-4 text-sm font-medium text-muted hover:text-ink"
        >
          {t("dashboard.conversations.correction.cancel")}
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={onNext}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-[6px] bg-ai px-4 text-sm font-medium text-on-ai disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSparkles size={16} /> {t("dashboard.conversations.correction.next")}
        </button>
      </div>
    </div>
  );
}
