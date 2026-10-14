"use client";

import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { ChatMessage } from "./useChatReply";

export function MessageBubble({ msg, picked = false }: { msg: ChatMessage; picked?: boolean }) {
  const { t } = useLanguage();

  return (
    <div
      className={clsx(
        "max-w-[80%] rounded-[13px] px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[70%]",
        msg.sender === "CUSTOMER" && "self-start rounded-tl-[4px] border border-border bg-surface",
        msg.sender === "AI" && "ml-auto self-end rounded-tr-[4px] border border-ai bg-ai-surface",
        msg.sender === "OPERATOR" && "ml-auto self-end rounded-tr-[4px] bg-primary text-white",
        picked && "ring-2 ring-ai ring-offset-2 ring-offset-soft",
      )}
    >
      {msg.sender === "AI" ? (
        <span className="mb-1 block text-[10px] font-semibold text-ai">✦ {t("dashboard.conversations.chatDetail.aiReply")}</span>
      ) : null}
      {msg.sender === "OPERATOR" ? (
        <span className="mb-1 block text-[10px] font-semibold opacity-80">
          {t("dashboard.conversations.chatDetail.adminManual")}
        </span>
      ) : null}
      {msg.text}
      <span
        className={clsx(
          "mt-1 block text-right text-[10px] tabular-nums",
          msg.sender === "OPERATOR" ? "opacity-70" : "text-faint",
        )}
      >
        {msg.timeLabel}
      </span>
    </div>
  );
}
