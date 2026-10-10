"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export function AiModuleNotice({ text }: { text: Text }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-ai bg-ai-surface px-3.5 py-3 text-[13px] text-ai">
      <IconSparkles size={17} className="mt-px shrink-0" />
      <span>{t(text)}</span>
    </div>
  );
}
