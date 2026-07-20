"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChatList } from "./ChatList";
import { ChatDetail } from "./ChatDetail";
import { CHATS } from "@/lib/dashboard/conversations";

/** Master–detail: side-by-side on desktop, list→detail push on mobile. */
export function ConversationsView() {
  const [selected, setSelected] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
      <div className={clsx(showDetail && "hidden lg:block")}>
        <ChatList
          selected={selected}
          onSelect={(i) => {
            setSelected(i);
            setShowDetail(true);
          }}
        />
      </div>
      <div className={clsx(!showDetail && "hidden lg:block")}>
        <ChatDetail chat={CHATS[selected]} onBack={() => setShowDetail(false)} />
      </div>
    </div>
  );
}
