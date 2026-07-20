import clsx from "clsx";
import { CHAT } from "@/lib/content/chat";
import type { ChatMessage } from "@/lib/chat/types";

/** A single chat message. AI bubbles carry the "✦ Sidekick AI" label. */
export function ChatBubble({
  message,
  aiTone = "neutral",
}: {
  message: ChatMessage;
  aiTone?: "neutral" | "blue";
}) {
  const isAi = message.role === "ai";
  const aiClass =
    aiTone === "blue"
      ? "border-blue-ring bg-blue-surface text-blue-ink"
      : "border-border bg-card2 text-ink";

  return (
    <div
      className={clsx(
        "max-w-[85%] whitespace-pre-line rounded-[14px] border px-3.5 py-2.5 text-sm leading-[1.55]",
        isAi
          ? clsx("self-start rounded-tl-[4px]", aiClass)
          : "ml-auto self-end rounded-tr-[4px] border-primary bg-primary text-white",
      )}
    >
      {isAi ? (
        <span className="mb-[3px] block text-[10px] font-semibold text-blue">
          {CHAT.aiLabel}
        </span>
      ) : null}
      {message.text}
    </div>
  );
}
