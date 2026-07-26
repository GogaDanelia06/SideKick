"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const params = useSearchParams();
  const showDetail = Boolean(selected);

  function apply(next: { c?: string | null; channel?: ChannelType | null }) {
    const q = new URLSearchParams(params.toString());
    if (next.c !== undefined) {
      if (next.c) q.set("c", next.c);
      else q.delete("c");
    }
    if (next.channel !== undefined) {
      if (next.channel) q.set("channel", next.channel);
      else q.delete("channel");
      q.delete("c");
    }
    router.push(`?${q.toString()}`, { scroll: false });
  }

  return (
    <div className="grid gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px] lg:grid-cols-[340px_1fr]">
      <div className={clsx("min-h-0 lg:h-full", showDetail && "hidden lg:block")}>
        <ChatList
          conversations={conversations}
          selectedId={selected?.id ?? null}
          channel={channel}
          onSelect={(id) => apply({ c: id })}
          onChannel={(c) => apply({ channel: c })}
        />
      </div>
      <div className={clsx("min-h-0 lg:h-full", !showDetail && "hidden lg:block")}>
        <ChatDetail chat={selected} onBack={() => apply({ c: null })} />
      </div>
    </div>
  );
}
