"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCircleFilled, IconMessageChatbot, IconRobot, IconX } from "@tabler/icons-react";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ChatTyping } from "./ChatTyping";
import { useChat } from "@/hooks/useChat";
import { CHAT, CHAT_CHIPS } from "@/lib/content/chat";
import { BRAND } from "@/lib/content/common";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { track } from "@/lib/analytics/track";

export function ChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { messages, typing, send, sendFile } = useChat(t(CHAT.widgetGreeting));
  const threadRef = useRef<HTMLDivElement>(null);

  // The thread is only 260px tall, so the third message already pushes the
  // newest one out of sight — and the typing dots with it. Runs on `open` too,
  // so re-opening the widget shows where the conversation left off.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-[92px] right-6 z-[60] w-[340px] max-w-[calc(100vw-48px)] overflow-hidden rounded-lg border border-border bg-card shadow-[0_16px_44px_rgba(0,0,0,0.5)]"
          >
            <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-full bg-blue-surface text-blue">
                <IconRobot size={16} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{BRAND} AI</div>
                <div className="flex items-center gap-1 text-[12px] text-muted">
                  <IconCircleFilled size={8} className="text-green" />
                  {t(CHAT.online)}
                </div>
              </div>
              <button type="button" aria-label={t(CHAT.ariaClose)} onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <IconX size={18} />
              </button>
            </header>
            <div ref={threadRef} className="flex max-h-[260px] flex-col gap-2.5 overflow-auto p-4">
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} aiTone="blue" />
              ))}
              {typing ? <ChatTyping aiTone="blue" /> : null}
            </div>

            {/* Only while the thread is untouched. Once someone has asked
                something of their own, three canned questions under their
                conversation are clutter, not help. */}
            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-2 px-4 pb-1">
                {CHAT_CHIPS.map((chip, i) => (
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
            ) : null}

            <ChatInput
              placeholder={t(CHAT.widgetPlaceholder)}
              onSend={send}
              onFile={sendFile}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        aria-label={t(CHAT.ariaChat)}
        onClick={() =>
          setOpen((o) => {
            // Only the opening counts; closing is not an engagement signal.
            if (!o) track("chat_widget_opened");
            return !o;
          })
        }
        className="fixed bottom-6 right-6 z-[60] grid size-14 place-items-center rounded-full bg-primary text-white"
      >
        <IconMessageChatbot size={24} />
      </button>
    </>
  );
}
