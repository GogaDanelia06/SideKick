"use client";

import clsx from "clsx";
import { IconCheck } from "@tabler/icons-react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "./useChatReply";

export function PickableBubble({ msg, picked, onToggle }: { msg: ChatMessage; picked: boolean; onToggle: () => void }) {
  return (
    <div
      role="checkbox"
      aria-checked={picked}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="flex cursor-pointer items-center justify-end gap-2.5 rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-blue"
    >
      <MessageBubble msg={msg} picked={picked} />
      <span
        aria-hidden
        className={clsx(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          picked ? "border-ai bg-ai text-on-ai" : "border-border bg-surface",
        )}
      >
        {picked ? <IconCheck size={12} stroke={3} /> : null}
      </span>
    </div>
  );
}
