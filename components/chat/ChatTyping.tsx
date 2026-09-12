"use client";

import clsx from "clsx";
import { BUBBLE_BASE, aiBubbleClass, type AiTone } from "./ChatBubble";
import { CHAT } from "@/lib/content/chat";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Typing indicator: decorative dots with a screen-reader status label. */
export function ChatTyping({ aiTone = "neutral" }: { aiTone?: AiTone }) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-label={t(CHAT.typing)}
      className={clsx(BUBBLE_BASE, aiBubbleClass(aiTone), "flex w-fit items-center gap-1.5 py-3")}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="chat-typing-dot size-1.5 rounded-full bg-current"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}
