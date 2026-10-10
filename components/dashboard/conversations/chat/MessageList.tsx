"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { ChatMessage } from "./useChatReply";

export function MessageList({
  chatId,
  messages,
  loading,
}: {
  chatId: string;
  messages: ChatMessage[];
  loading: boolean;
}) {
  const { t } = useLanguage();
  const thread = useRef<HTMLDivElement>(null);
  const count = messages.length;

  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatId, count]);

  return (
    <div ref={thread} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-soft p-4">
      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <span className="skeleton h-9 w-[55%] rounded-[13px]" />
          <span className="skeleton ml-auto h-9 w-[45%] rounded-[13px]" />
          <span className="skeleton h-12 w-[65%] rounded-[13px]" />
        </div>
      ) : messages.length === 0 ? (
        <p className="m-auto text-sm text-muted">{t("dashboard.conversations.chatDetail.noMessages")}</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "max-w-[80%] rounded-[13px] px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[70%]",
              msg.sender === "CUSTOMER" && "self-start rounded-tl-[4px] border border-border bg-surface",
              msg.sender === "AI" && "ml-auto self-end rounded-tr-[4px] border border-ai bg-ai-surface",
              msg.sender === "OPERATOR" && "ml-auto self-end rounded-tr-[4px] bg-primary text-white",
            )}
          >
            {msg.sender === "AI" ? (
              <span className="mb-1 block text-[10px] font-semibold text-ai">
                ✦ {t("dashboard.conversations.chatDetail.aiReply")}
              </span>
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
        ))
      )}
    </div>
  );
}
