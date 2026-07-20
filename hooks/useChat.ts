"use client";

import { useCallback, useRef, useState } from "react";
import { getBotReply } from "@/lib/chat/bot";
import type { ChatMessage } from "@/lib/chat/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * Local demo chat state. The AI greeting is kept out of state and prepended on
 * every render, so it always reflects the active locale; sent messages keep the
 * language they were written in. Swap `getBotReply` for a network call to make
 * this production-grade without touching the UI.
 */
export function useChat(greeting: string) {
  const { t } = useLanguage();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const idRef = useRef(1);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const reply = t(getBotReply(trimmed));
      const n = idRef.current++;
      setHistory((prev) => [
        ...prev,
        { id: `u${n}`, role: "user", text: trimmed },
        { id: `a${n}`, role: "ai", text: reply },
      ]);
    },
    [t],
  );

  const seed: ChatMessage = { id: "seed", role: "ai", text: greeting };
  return { messages: [seed, ...history], send };
}
