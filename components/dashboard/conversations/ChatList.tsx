"use client";

import type { ChannelType } from "@prisma/client";
import type { ConversationRow } from "@/lib/dashboard/queries";
import { ChannelFilter } from "./list/ChannelFilter";
import { ChatRow } from "./list/ChatRow";
import { EmptyList } from "./list/EmptyList";
import { Legend } from "./list/Legend";

export function ChatList({
  conversations,
  selectedId,
  channel,
  onSelect,
  onChannel,
}: {
  conversations: ConversationRow[];
  selectedId: string | null;
  channel: ChannelType | null;
  onSelect: (id: string) => void;
  onChannel: (c: ChannelType | null) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <ChannelFilter channel={channel} onChannel={onChannel} />
      <Legend />

      <div className="min-h-0 flex-1 overflow-auto">
        {conversations.length === 0 ? (
          <EmptyList />
        ) : (
          conversations.map((c) => (
            <ChatRow key={c.id} conversation={c} selected={selectedId === c.id} onSelect={() => onSelect(c.id)} />
          ))
        )}
      </div>
    </div>
  );
}
