"use client";

import { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export function WorkingIndicator({ hint }: { hint: Text }) {
  const { t } = useLanguage();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-[10px] border border-ai bg-ai-surface px-3.5 py-3 text-ai"
    >
      <IconLoader2 size={18} className="shrink-0 animate-spin" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium tabular-nums">{t("common.aiWorking", { seconds })}</div>
        <div className="text-[12px] opacity-80">{t(hint)}</div>
      </div>
    </div>
  );
}
