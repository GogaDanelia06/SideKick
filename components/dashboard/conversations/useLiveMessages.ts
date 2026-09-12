"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ConversationDetail } from "@/lib/dashboard/queries";

/** Polls the open conversation and refreshes the list, so the inbox stays current. */

const CHAT_MS = 5_000;

/** The list is the bigger query, so it polls a little less often. */
const LIST_MS = 8_000;

export function useLiveMessages(
  openId: string | null,
  onChat: (chat: ConversationDetail) => void,
) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;

    async function pullChat() {
      if (!openId || document.hidden) return;
      try {
        const res = await fetch(`/api/dashboard/conversations/${openId}`);
        if (!res.ok) return;
        const chat = (await res.json()) as ConversationDetail;
        if (!stopped) onChat(chat);
      } catch {
        // The next tick retries.
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
