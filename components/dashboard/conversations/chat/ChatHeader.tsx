"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { CHANNEL_META } from "@/lib/dashboard/channelMeta";
import type { ConversationDetail } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ChatActions } from "./ChatActions";

export function ChatHeader({
  chat,
  makingLead,
  onBack,
  onMakeLead,
  onReleased,
  onAiChange,
}: {
  chat: ConversationDetail;
  makingLead: boolean;
  onBack: () => void;
  onMakeLead: () => void;
  onReleased?: () => void;
  onAiChange?: (aiEnabled: boolean) => void;
}) {
  const { t } = useLanguage();
  const m = chat.channelType ? CHANNEL_META[chat.channelType] : null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-border2 p-3">
      <button type="button" onClick={onBack} aria-label={t("common.back")} className="text-muted lg:hidden">
        <IconArrowLeft size={20} />
      </button>
      <span className="grid size-9 place-items-center rounded-full border border-border bg-soft font-semibold text-muted">
        {chat.initials}
      </span>
      <div className="mr-auto">
        <div className="font-semibold">{chat.name}</div>
        <div className="flex items-center gap-1 text-xs text-muted">
          {m ? <m.icon size={13} style={{ color: m.color }} /> : null}
          {chat.status === "NEW"
            ? t("dashboard.conversations.chatDetail.new")
            : chat.status === "DONE"
              ? t("dashboard.conversations.chatDetail.done")
              : t("dashboard.conversations.chatDetail.ongoing")}
        </div>
      </div>

      <ChatActions
        chat={chat}
        makingLead={makingLead}
        onMakeLead={onMakeLead}
        onReleased={onReleased}
        onAiChange={onAiChange}
      />
    </div>
  );
}
