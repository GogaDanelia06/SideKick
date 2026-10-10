"use client";

import clsx from "clsx";
import { IconShoppingCart, IconUserPlus } from "@tabler/icons-react";
import type { ConversationDetail } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AiSwitch } from "./AiSwitch";
import { MARK } from "./constants";
import { HandBackButton } from "./HandBackButton";

export function ChatActions({
  chat,
  makingLead,
  onMakeLead,
  onReleased,
  onAiChange,
}: {
  chat: ConversationDetail;
  makingLead: boolean;
  onMakeLead: () => void;
  onReleased?: () => void;
  onAiChange?: (aiEnabled: boolean) => void;
}) {
  const { t } = useLanguage();

  return (
    <>
      {chat.handedOver ? <HandBackButton chatId={chat.id} onReleased={onReleased} /> : null}

      <button
        type="button"
        disabled={chat.hasLead || makingLead}
        onClick={onMakeLead}
        title={t(
          chat.hasLead
            ? "dashboard.conversations.chatDetail.thisConversationAlreadyHas"
            : "dashboard.conversations.chatDetail.createALeadFrom",
        )}
        className={clsx(
          MARK,
          chat.hasLead
            ? "cursor-default border-green bg-green-surface text-green"
            : "border-border text-muted hover:border-green hover:text-green disabled:opacity-60",
        )}
      >
        <IconUserPlus size={15} /> {t("dashboard.conversations.chatDetail.lead")}
      </button>
      <span
        title={t("dashboard.conversations.chatDetail.ordersAreCreatedFrom")}
        className={clsx(MARK, chat.hasOrder ? "border-blue bg-blue-surface text-blue" : "border-border text-muted")}
      >
        <IconShoppingCart size={15} /> {t("dashboard.conversations.chatDetail.order")}
      </span>

      <AiSwitch chatId={chat.id} aiEnabled={chat.aiEnabled} onChange={onAiChange} />
    </>
  );
}
