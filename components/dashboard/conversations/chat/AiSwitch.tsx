"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { IconRobot } from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import { setConversationAi } from "@/lib/dashboard/actions/conversations";

export function AiSwitch({
  chatId,
  aiEnabled,
  onChange,
}: {
  chatId: string;
  aiEnabled: boolean;
  onChange?: (aiEnabled: boolean) => void;
}) {
  const [, start] = useTransition();

  return (
    <span
      className={clsx(
        "flex items-center gap-2 rounded-[6px] border border-border px-2.5 py-1.5 text-xs font-medium",
        aiEnabled ? "bg-ai-surface" : "bg-soft",
      )}
    >
      <IconRobot size={15} className="text-ai" /> AI
      <Switch
        on={aiEnabled}
        onToggle={() => {
          const next = !aiEnabled;
          onChange?.(next);
          start(() => setConversationAi(chatId, next));
        }}
        tone="ai"
        ariaLabel="AI"
      />
    </span>
  );
}
