"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import { ChatList } from "./ChatList";
import { ChatDetail } from "./ChatDetail";
import type { ConversationDetail, ConversationRow } from "@/lib/dashboard/queries";

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

  /**
   * Conversations already fetched, kept for as long as the page is open.
   *
   * Picking a chat used to change the URL, which re-ran the whole page on the
   * server: a hundred conversations queried again, the shell re-rendered, the
   * messages arriving as a full navigation. Long enough to feel like the click
   * had not registered.
   *
   * Now only the chosen conversation is fetched, and coming back to one already
   * read costs nothing — which is the common move, since a merchant reads one,
   * answers another, and returns.
   */
  const [cache, setCache] = useState<Record<string, ConversationDetail>>(
    selected ? { [selected.id]: selected } : {},
  );

  const chat = openId ? (cache[openId] ?? null) : null;

  /**
   * Which channel the list is narrowed to, decided here rather than on the
   * server.
   *
   * Going through the server meant a full page load for a filter over rows the
   * browser was already holding — the wait was the same as opening the inbox
   * from scratch, for a click that changes nothing but what is shown.
   *
   * The list arrives capped at a hundred conversations, so on an inbox larger
   * than that this narrows the hundred most recent rather than fetching the
   * hundred most recent of one channel. No merchant is near that yet, and the
   * exchange is a filter that answers instantly.
   */
  const [filter, setFilter] = useState<ChannelType | null>(channel);
  const shown = filter ? conversations.filter((c) => c.channelType === filter) : conversations;

  async function open(id: string | null) {
    setOpenId(id);

    // `history` rather than the router: the address bar should follow the
    // selection so a chat can be linked to and survives a refresh, but going
    // through Next would fetch the page again and undo the point of all this.
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
        />
      </div>
    </div>
  );
}
