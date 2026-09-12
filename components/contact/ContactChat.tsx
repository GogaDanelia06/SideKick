"use client";

import { IconCircleFilled, IconPaperclip, IconRobot, IconSend } from "@tabler/icons-react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { CHAT, CHAT_CHIPS } from "@/lib/content/chat";
import { BRAND } from "@/lib/content/common";
import { CONTACT_PREVIEW, CONTACT_SEED } from "@/lib/content/contact";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** A static illustration of the assistant (the floating widget is the real chat); nothing is interactive. */
export function ContactChat() {
  const { t } = useLanguage();

  return (
    <div className="flex cursor-default flex-col overflow-hidden rounded-lg border border-border bg-card">
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

      <div className="flex flex-col gap-2.5 p-4">
        <ChatBubble message={{ id: "seed", role: "ai", text: t(CONTACT_SEED) }} />
        {CONTACT_PREVIEW.map((m, i) => (
          <ChatBubble key={i} message={{ id: `p${i}`, role: m.role, text: t(m.text) }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {CHAT_CHIPS.map((chip, i) => (
          <span
            key={i}
            className="rounded-full border border-blue-border bg-blue-surface px-3 py-1.5 text-[12px] font-medium text-blue"
          >
            {t(chip)}
          </span>
        ))}
      </div>

      {/* A drawn composer, hidden from assistive tech because it cannot be typed into. */}
      <div aria-hidden className="flex gap-2 border-t border-border p-3">
        <span className="grid w-10 shrink-0 place-items-center rounded-sm border border-input text-muted">
          <IconPaperclip size={18} />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-sm border border-input bg-bg px-3 py-2.5 text-sm text-muted">
          {t(CHAT.contactPlaceholder)}
        </span>
        <span className="grid w-11 shrink-0 place-items-center rounded-sm bg-primary text-white">
          <IconSend size={18} />
        </span>
      </div>
    </div>
  );
}
