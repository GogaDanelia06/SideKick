"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ChannelType } from "@prisma/client";
import type { ConversationDetail, ConversationRow } from "@/lib/dashboard/queries";
import { ChatDetail } from "./ChatDetail";
import { ChatList } from "./ChatList";
import { replaceQuery } from "./replaceQuery";
import { useOpenConversation } from "./useOpenConversation";

export function ConversationsView({
  conversations,
  selected,
  channel,
}: {
  conversations: ConversationRow[];
  selected: ConversationDetail | null;
  channel: ChannelType | null;
}) {
  const view = useOpenConversation(conversations, selected);
  const [filter, setFilter] = useState<ChannelType | null>(channel);
  const shown = filter ? conversations.filter((c) => c.channelType === filter) : conversations;

  function chooseChannel(c: ChannelType | null) {
    setFilter(c);
    replaceQuery((params) => {
      if (c) params.set("channel", c);
      else params.delete("channel");
      params.delete("c");
    });
    view.close();
  }

  return (
    <div className="grid gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px] lg:grid-cols-[340px_1fr]">
      <div className={clsx("min-h-0 lg:h-full", view.openId && "hidden lg:block")}>
        <ChatList
          conversations={shown}
          selectedId={view.openId}
          channel={filter}
          onSelect={(id) => void view.open(id)}
          onChannel={chooseChannel}
        />
      </div>
      <div className={clsx("min-h-0 lg:h-full", !view.openId && "hidden lg:block")}>
        <ChatDetail
          chat={view.chat}
          loading={view.loading}
          onBack={() => void view.open(null)}
          onLead={() => view.patchOpen((open) => ({ ...open, hasLead: true }))}
          onSent={(message) => view.patchOpen((open) => ({ ...open, messages: [...open.messages, message] }))}
          onAiChange={(aiEnabled) => view.patchOpen((open) => ({ ...open, aiEnabled }))}
          onReleased={() => view.patchOpen((open) => ({ ...open, handedOver: false, aiEnabled: true }))}
        />
      </div>
    </div>
  );
}
