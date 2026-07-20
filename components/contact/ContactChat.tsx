"use client";

import { useEffect, useRef } from "react";
import { IconCircleFilled, IconRobot } from "@tabler/icons-react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { CHAT } from "@/lib/content/chat";
import { BRAND } from "@/lib/content/common";
import { CONTACT_CHIPS, CONTACT_SEED } from "@/lib/content/contact";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Embedded live AI chat — the interactive centerpiece of the contact page. */
export function ContactChat() {
  const { t } = useLanguage();
  const { messages, send } = useChat(t(CONTACT_SEED));
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-[600px] max-h-[80vh] flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center gap-2.5 border-b border-border p-4">
        <span className="grid size-[38px] place-items-center rounded-full bg-blue-surface text-blue">
          <IconRobot size={19} />
        </span>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">{BRAND} AI</div>
          <div className="flex items-center gap-1 text-[12px] text-muted">
            <IconCircleFilled size={8} className="text-green" />
            {t(CHAT.onlineDetailed)}
          </div>
        </div>
      </header>
      <div ref={threadRef} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {CONTACT_CHIPS.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => send(t(chip))}
            className="rounded-full border border-blue-border bg-blue-surface px-3 py-1.5 text-[12px] font-medium text-blue"
          >
            {t(chip)}
          </button>
        ))}
      </div>
      <ChatInput placeholder={t(CHAT.contactPlaceholder)} onSend={send} />
    </div>
  );
}
