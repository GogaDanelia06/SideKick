"use client";

import clsx from "clsx";
import { IconWand } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { MARK } from "./constants";

export function CorrectButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={t("dashboard.conversations.correction.buttonHint")}
      className={clsx(
        MARK,
        active ? "border-ai bg-ai-surface text-ai" : "border-border text-muted hover:border-ai hover:text-ai",
      )}
    >
      <IconWand size={15} /> {t("dashboard.conversations.correction.button")}
    </button>
  );
}
