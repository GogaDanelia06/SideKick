"use client";

import { IconMessage2 } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function EmptyChat() {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-[14px] border border-border bg-surface p-8 text-center">
      <IconMessage2 size={28} className="text-faint" />
      <p className="text-sm font-medium">{t("dashboard.conversations.chatDetail.selectAConversation")}</p>
      <p className="max-w-[320px] text-xs text-muted">
        {t("dashboard.conversations.chatDetail.onceFacebookInstagramWhatsapp")}
      </p>
    </div>
  );
}
