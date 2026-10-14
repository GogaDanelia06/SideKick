"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { MessageBubble } from "./MessageBubble";
import { PickableBubble } from "./PickableBubble";
import type { ChatMessage } from "./useChatReply";

export function MessageList({
  chatId,
  messages,
  loading,
  selectable = false,
  selected = [],
  onToggle,
}: {
  chatId: string;
  messages: ChatMessage[];
  loading: boolean;
  selectable?: boolean;
  selected?: string[];
  onToggle?: (id: string) => void;
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
        messages.map((msg) =>
          selectable && msg.sender === "AI" && onToggle ? (
            <PickableBubble key={msg.id} msg={msg} picked={selected.includes(msg.id)} onToggle={() => onToggle(msg.id)} />
          ) : (
            <MessageBubble key={msg.id} msg={msg} />
          ),
        )
      )}
    </div>
  );
}
