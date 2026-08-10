import clsx from "clsx";
import { ChatAttachment } from "./ChatAttachment";
import { CHAT } from "@/lib/content/chat";
import type { ChatMessage } from "@/lib/chat/types";

/** Which palette the AI side uses — blue in the floating widget, neutral on the
 *  contact page. Exported so the typing indicator can match its own surface. */
export type AiTone = "neutral" | "blue";

/** Shared with ChatTyping so a "typing" bubble is the same shape as the reply
 *  that replaces it. Two copies of these classes drifted apart the moment one
 *  of them was edited. */
export const BUBBLE_BASE =
  "max-w-[85%] whitespace-pre-line rounded-[14px] border px-3.5 py-2.5 text-sm leading-[1.55]";

export function aiBubbleClass(aiTone: AiTone): string {
  return clsx(
    "self-start rounded-tl-[4px]",
    aiTone === "blue"
      ? "border-blue-ring bg-blue-surface text-blue-ink"
      : "border-border bg-card2 text-ink",
  );
}

export function ChatBubble({
  message,
  aiTone = "neutral",
}: {
  message: ChatMessage;
  aiTone?: AiTone;
}) {
  const isAi = message.role === "ai";

  return (
    <div
      className={clsx(
        BUBBLE_BASE,
        isAi
          ? aiBubbleClass(aiTone)
          : "ml-auto self-end rounded-tr-[4px] border-primary bg-primary text-white",
      )}
    >
      {isAi ? (
        <span className="mb-[3px] block text-[10px] font-semibold text-blue">
          {CHAT.aiLabel}
        </span>
      ) : null}
      {message.attachment ? <ChatAttachment attachment={message.attachment} /> : null}
      {message.text}
    </div>
  );
}
