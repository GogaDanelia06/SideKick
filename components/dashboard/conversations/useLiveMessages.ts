"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ConversationDetail } from "@/lib/dashboard/queries";

/**
 * Keeps the inbox current without anyone pressing reload.
 *
 * A customer message arrives through a webhook and the AI answers seconds
 * later, both on the server, with nothing to tell a browser that is already
 * open. Until this existed the merchant watched a thread that had moved on
 * without them — a conversation continuing in Messenger while their screen said
 * nothing had happened since.
 *
 * Polling rather than a socket: the traffic is a handful of rows every few
 * seconds, one connection per open inbox is a cost with no payer yet, and a
 * poll that fails simply tries again on the next tick.
 */

/** The open thread, often enough that a reply feels live. */
const CHAT_MS = 5_000;

/** The list, less often: it is a bigger query and new chats are rarer. */
const LIST_MS = 20_000;

export function useLiveMessages(
  openId: string | null,
  onChat: (chat: ConversationDetail) => void,
) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;

    async function pullChat() {
      // A background tab is nobody watching. Skipping it keeps a forgotten
      // window from polling all night for a screen no one is reading.
      if (!openId || document.hidden) return;
      try {
        const res = await fetch(`/api/dashboard/conversations/${openId}`);
        if (!res.ok) return;
        const chat = (await res.json()) as ConversationDetail;
        if (!stopped) onChat(chat);
      } catch {
        // Offline, or the tab is going away. The next tick is the retry.
      }
    }

    const chat = setInterval(pullChat, CHAT_MS);
    const list = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, LIST_MS);

    return () => {
      stopped = true;
      clearInterval(chat);
      clearInterval(list);
    };
  }, [openId, onChat, router]);
}
