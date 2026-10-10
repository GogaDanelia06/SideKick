"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { IconRotateClockwise } from "@tabler/icons-react";
import { handBackToAi } from "@/lib/dashboard/actions/conversations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { MARK } from "./constants";

export function HandBackButton({ chatId, onReleased }: { chatId: string; onReleased?: () => void }) {
  const { t } = useLanguage();
  const [, start] = useTransition();
  const [releasing, setReleasing] = useState(false);

  return (
    <button
      type="button"
      disabled={releasing}
      onClick={() => {
        setReleasing(true);
        start(async () => {
          const res = await handBackToAi(chatId);
          if (res.ok) onReleased?.();
          setReleasing(false);
        });
      }}
      title={t("dashboard.conversations.chatDetail.theAiAskedFor")}
      className={clsx(MARK, "border-red bg-red-surface text-red disabled:opacity-60")}
    >
      <IconRotateClockwise size={15} />
      {releasing
        ? t("dashboard.conversations.chatDetail.handingBack")
        : t("dashboard.conversations.chatDetail.giveBackToAi")}
    </button>
  );
}
