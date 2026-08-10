"use client";

import clsx from "clsx";
import { BUBBLE_BASE, aiBubbleClass, type AiTone } from "./ChatBubble";
import { CHAT } from "@/lib/content/chat";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * The "…" bubble shown while the assistant composes its answer.
 *
 * Sits in the same bubble as the reply that replaces it, so the answer appears
 * where the dots were rather than jumping to a new position.
 *
 * `role="status"` announces it once, politely, to a screen reader — the dots
 * themselves are decoration and hidden, because "three bullet points" is not
 * what is happening. The label is the only text a reader gets, which is why it
 * says who is typing.
 */
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
