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
    // Fixed to the viewport so both panes fill the screen and scroll
    // internally — a chat pane that grows with its content would push the
    // message composer off the bottom of the page.
    <div className="grid gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px] lg:grid-cols-[340px_1fr]">
      <div className={clsx("min-h-0 lg:h-full", showDetail && "hidden lg:block")}>
        <ChatList
          selected={selected}
          onSelect={(i) => {
            setSelected(i);
            setShowDetail(true);
          }}
        />
      </div>
      <div className={clsx("min-h-0 lg:h-full", !showDetail && "hidden lg:block")}>
        <ChatDetail chat={CHATS[selected]} onBack={() => setShowDetail(false)} />
      </div>
    </div>
  );
}
