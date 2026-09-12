"use client";

import { useCallback, useState } from "react";
import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import { ChatList } from "./ChatList";
import { ChatDetail } from "./ChatDetail";
import type { ConversationDetail, ConversationRow } from "@/lib/dashboard/queries";
import { useLiveMessages } from "./useLiveMessages";

export function ConversationsView({
  conversations,
  selected,
  channel,
}: {
  conversations: ConversationRow[];
  selected: ConversationDetail | null;
  channel: ChannelType | null;
}) {
  const [openId, setOpenId] = useState<string | null>(selected?.id ?? null);

  /** Conversations fetched during this visit; reopening one is instant. */
  const [cache, setCache] = useState<Record<string, ConversationDetail>>(
    selected ? { [selected.id]: selected } : {},
  );

  /** The open chat: its header comes from the list row, its messages from the cache once fetched. */
  const cached = openId ? cache[openId] : undefined;
  const row = openId ? conversations.find((c) => c.id === openId) : undefined;

  const chat: ConversationDetail | null =
    cached ??
    (row
      ? {
          id: row.id,
          name: row.name,
          initials: row.initials,
          channelType: row.channelType,
          status: row.status,
          aiEnabled: row.aiEnabled,
          handedOver: row.alert === "wait",
          hasLead: row.ring === "lead" || row.ring === "order",
          hasOrder: row.ring === "order",
          messages: [],
        }
      : null);

  const loading = Boolean(openId) && !cached;

  /** Stable, so the polling effect is not restarted on every render. */
  const receive = useCallback((chat: ConversationDetail) => {
    setCache((prev) => ({ ...prev, [chat.id]: chat }));
  }, []);

  useLiveMessages(openId, receive);

  /** Filtered on the client; the list is capped at 100 rows, so this narrows those. */
  const [filter, setFilter] = useState<ChannelType | null>(channel);
  const shown = filter ? conversations.filter((c) => c.channelType === filter) : conversations;

  async function open(id: string | null) {
    setOpenId(id);

    // history rather than the router: the URL stays shareable without refetching the page.
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("c", id);
    else url.searchParams.delete("c");
    window.history.replaceState(null, "", url);

    if (!id || cache[id]) return;

    const res = await fetch(`/api/dashboard/conversations/${id}`);
    if (!res.ok) return;

    const fresh: ConversationDetail = await res.json();
    setCache((current) => ({ ...current, [id]: fresh }));
  }

  return (
    <div className="grid gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px] lg:grid-cols-[340px_1fr]">
      <div className={clsx("min-h-0 lg:h-full", openId && "hidden lg:block")}>
        <ChatList
          conversations={shown}
          selectedId={openId}
          channel={filter}
          onSelect={(id) => void open(id)}
          onChannel={(c) => {
            setFilter(c);
            const url = new URL(window.location.href);
            if (c) url.searchParams.set("channel", c);
            else url.searchParams.delete("channel");
            url.searchParams.delete("c");
            window.history.replaceState(null, "", url);
            setOpenId(null);
          }}
        />
      </div>
      <div className={clsx("min-h-0 lg:h-full", !openId && "hidden lg:block")}>
        <ChatDetail
          chat={chat}
          loading={loading}
          onBack={() => void open(null)}
          onLead={() =>
            setCache((current) => {
              const open = openId && current[openId];
              if (!open) return current;
              return { ...current, [openId]: { ...open, hasLead: true } };
            })
          }
          onSent={(message) =>
            setCache((current) => {
              const open = openId && current[openId];
              if (!open) return current;
              return { ...current, [openId]: { ...open, messages: [...open.messages, message] } };
            })
          }
          /* Mirror accepted changes into the cache, which takes precedence over server rows. */
          onAiChange={(aiEnabled) =>
            setCache((current) => {
              const open = openId && current[openId];
              if (!open) return current;
              return { ...current, [openId]: { ...open, aiEnabled } };
            })
          }
          onReleased={() =>
            setCache((current) => {
              const open = openId && current[openId];
              if (!open) return current;
              return { ...current, [openId]: { ...open, handedOver: false, aiEnabled: true } };
            })
          }
        />
      </div>
    </div>
  );
}
