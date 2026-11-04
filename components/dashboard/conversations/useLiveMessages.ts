"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ConversationDetail } from "@/lib/dashboard/queries";

const CHAT_MS = 5_000;

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
      const res = await fetch(`/api/dashboard/conversations/${openId}`).catch(() => null);
      if (!res?.ok) return;
      const chat = (await res.json().catch(() => null)) as ConversationDetail | null;
      if (chat && !stopped) onChat(chat);
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
