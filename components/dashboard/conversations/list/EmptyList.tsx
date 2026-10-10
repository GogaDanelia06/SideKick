"use client";

import { IconInbox } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function EmptyList() {
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <IconInbox size={26} className="text-faint" />
      <p className="text-sm font-medium">{t("dashboard.conversations.chatList.noConversationsYet")}</p>
      <p className="max-w-[240px] text-xs text-muted">
        {t("dashboard.conversations.chatList.messagesAppearHereAs")}
      </p>
    </div>
  );
}
