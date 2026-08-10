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
    // Closing the widget or leaving the page mid-compose would otherwise set
    // state on a component that is gone, and leak every preview it made.
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
      // The first message is what turns an opened widget into a conversation.
      if (idRef.current === 1) track("chat_conversation_started");

      const n = idRef.current++;
      // The question shows at once; only the answer waits.
      setHistory((prev) => [...prev, { id: `u${n}`, role: "user", text: trimmed }]);
      scheduleReply(`a${n}`, t(getBotReply(trimmed)));
    },
    [t, scheduleReply],
  );

  /**
   * Shows a picked photo or video in the thread.
   *
   * The file is **not uploaded**. It is rendered from an object URL and stays in
   * this tab: there is nothing on the other end of this chat to receive it, and
   * storing a file no one can ever read again would be cost without a purpose.
   * When the widget gets a real backend — the WEBSITE channel — this is the one
   * function that changes.
   *
   * Returns an error code for the caller to translate, or null on success.
   */
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
