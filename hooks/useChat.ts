"use client";

import { useCallback, useRef, useState } from "react";
import { getBotReply } from "@/lib/chat/bot";
import type { ChatMessage } from "@/lib/chat/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

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
