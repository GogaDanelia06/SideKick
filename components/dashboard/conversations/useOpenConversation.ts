import { useCallback, useState } from "react";
import type { ConversationDetail, ConversationRow } from "@/lib/dashboard/queries";
import { chatFromRow } from "./chatFromRow";
import { replaceQuery } from "./replaceQuery";
import { useLiveMessages } from "./useLiveMessages";

export function useOpenConversation(conversations: ConversationRow[], selected: ConversationDetail | null) {
  const [openId, setOpenId] = useState<string | null>(selected?.id ?? null);
  const [cache, setCache] = useState<Record<string, ConversationDetail>>(
    selected ? { [selected.id]: selected } : {},
  );

  const cached = openId ? cache[openId] : undefined;
  const row = openId ? conversations.find((c) => c.id === openId) : undefined;
  const chat: ConversationDetail | null = cached ?? (row ? chatFromRow(row) : null);

  const receive = useCallback((fresh: ConversationDetail) => {
    setCache((prev) => ({ ...prev, [fresh.id]: fresh }));
  }, []);

  useLiveMessages(openId, receive);

  async function open(id: string | null) {
    setOpenId(id);
    replaceQuery((params) => (id ? params.set("c", id) : params.delete("c")));

    if (!id || cache[id]) return;

    const res = await fetch(`/api/dashboard/conversations/${id}`);
    if (!res.ok) return;

    const fresh: ConversationDetail = await res.json();
    setCache((current) => ({ ...current, [id]: fresh }));
  }

  function patchOpen(change: (open: ConversationDetail) => ConversationDetail) {
    setCache((current) => {
      const open = openId && current[openId];
      if (!open) return current;
      return { ...current, [openId]: change(open) };
    });
  }

  return { openId, chat, loading: Boolean(openId) && !cached, open, close: () => setOpenId(null), patchOpen };
}
