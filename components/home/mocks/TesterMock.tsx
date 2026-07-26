"use client";

import { IconCircleFilled, IconFlask, IconMessageQuestion, IconPlayerPlay } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/useLanguage";

const COPY = {
  title: { ka: "AI ტესტერი", en: "AI tester" },
  mode: { ka: "სატესტო რეჟიმი", en: "test mode" },
  prompt: { ka: "რა ღირს AirPods Pro?", en: "How much are the AirPods Pro?" },
  run: { ka: "გატესტე", en: "Test it" },
  q: { ka: "რა ღირს AirPods Pro და მარაგშია?", en: "How much are the AirPods Pro, and are they in stock?" },
  label: { ka: "✦ AI — სატესტო პასუხი", en: "✦ AI — test reply" },
  a: { ka: "AirPods Pro ღირს 649₾ და ამჟამად მარაგშია. გსურთ შეკვეთა?", en: "The AirPods Pro cost ₾649 and are currently in stock. Would you like to order?" },
};

export function TesterMock() {
  const { t } = useLanguage();
  return (
    <Card className="flex flex-col gap-3 rounded-lg p-[18px]">
      <div className="flex items-center gap-2.5 border-b border-border pb-3 text-[13px] text-muted">
        <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-primary text-white">
          <IconFlask size={15} />
        </span>
        <b className="text-sm font-semibold text-ink">{t(COPY.title)}</b>
        <span className="ml-auto flex items-center gap-1">
          <IconCircleFilled size={8} className="text-green" />
          {t(COPY.mode)}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-input bg-bg px-3 py-2.5 text-[13px] text-muted">
          <IconMessageQuestion size={16} className="shrink-0 text-blue" />
          <span className="truncate">{t(COPY.prompt)}</span>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-white">
          <IconPlayerPlay size={16} />
          {t(COPY.run)}
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="max-w-[80%] self-start rounded-[13px] rounded-tl-[4px] border border-border bg-card2 px-[13px] py-2.5 text-sm leading-[1.5]">
          {t(COPY.q)}
        </div>
        <div className="max-w-[80%] self-start rounded-[13px] rounded-tl-[4px] border border-blue-ring bg-blue-surface px-[13px] py-2.5 text-sm leading-[1.5] text-blue-ink">
          <span className="mb-[3px] block text-[10px] font-semibold opacity-80">{t(COPY.label)}</span>
          {t(COPY.a)}
        </div>
      </div>
    </Card>
  );
}
