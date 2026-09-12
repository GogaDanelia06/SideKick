"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ATTACHMENT_REPLY, getBotReply } from "@/lib/chat/bot";
import { classifyAttachment, type AttachmentError } from "@/lib/chat/attachment";
import { track } from "@/lib/analytics/track";
import type { ChatMessage } from "@/lib/chat/types";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { composeDelay } from "@/lib/chat/compose";

export function useChat(greeting: string) {
  const { t } = useLanguage();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);

  /** Replies still waiting on their timer. The indicator stays up until the
   *  last one lands, so a quick second question does not clear it early. */
  const pending = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** When the last scheduled reply is due, so replies cannot overtake each
   *  other and answer two questions in the wrong order. */
  const readyAt = useRef(0);
  /** Object URLs handed to <img>/<video>, released on unmount. */
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    // Cancel pending replies and release previews on unmount.
    const pendingTimers = timers.current;
    const urls = objectUrls.current;
    return () => {
      pendingTimers.forEach(clearTimeout);
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

  const scheduleReply = useCallback((id: string, reply: string) => {
    const now = Date.now();
    const delay = Math.max(readyAt.current - now, 0) + composeDelay(reply);
    readyAt.current = now + delay;

    pending.current += 1;
    setTyping(true);

    timers.current.push(
      setTimeout(() => {
        setHistory((prev) => [...prev, { id, role: "ai", text: reply }]);
        pending.current -= 1;
        if (pending.current === 0) setTyping(false);
      }, delay),
    );
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (idRef.current === 1) track("chat_conversation_started");

      const n = idRef.current++;
      setHistory((prev) => [...prev, { id: `u${n}`, role: "user", text: trimmed }]);
      scheduleReply(`a${n}`, t(getBotReply(trimmed)));
    },
    [t, scheduleReply],
  );

  /** Shows a picked file from a local object URL (nothing is uploaded). Returns an error code or null. */
  const sendFile = useCallback(
    (file: File): AttachmentError | null => {
      const verdict = classifyAttachment(file);
      if ("error" in verdict) return verdict.error;

      if (idRef.current === 1) track("chat_conversation_started");

      const n = idRef.current++;
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);

      setHistory((prev) => [
        ...prev,
        {
          id: `u${n}`,
          role: "user",
          text: "",
          attachment: { kind: verdict.kind, url, name: file.name },
        },
      ]);
      scheduleReply(`a${n}`, t(ATTACHMENT_REPLY));
      return null;
    },
    [t, scheduleReply],
  );

  const seed: ChatMessage = { id: "seed", role: "ai", text: greeting };
  return { messages: [seed, ...history], typing, send, sendFile };
}
