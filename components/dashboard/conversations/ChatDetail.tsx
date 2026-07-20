"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconRobot,
  IconSend,
  IconShoppingCart,
  IconUserPlus,
} from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import { THREAD, type Chat } from "@/lib/dashboard/conversations";
import { useLanguage } from "@/lib/i18n/useLanguage";

const MARK = "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 text-xs font-medium";

/** Right pane: the selected conversation with agent controls. */
export function ChatDetail({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const { t } = useLanguage();
  const [ai, setAi] = useState(true);
  const [lead, setLead] = useState(false);
  const [order, setOrder] = useState(false);

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border2 p-3">
        <button type="button" onClick={onBack} aria-label="Back" className="text-muted lg:hidden">
          <IconArrowLeft size={20} />
        </button>
        <span className="grid size-9 place-items-center rounded-full border border-border bg-soft font-semibold text-muted">
          {chat.initials}
        </span>
        <div className="mr-auto">
          <div className="font-semibold">{chat.name}</div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <chat.channel size={13} style={{ color: chat.channelColor }} />
            {t({ ka: "მიმდინარე", en: "Ongoing" })}
          </div>
        </div>
        <button type="button" onClick={() => setLead((v) => !v)} className={clsx(MARK, lead ? "border-green bg-green-surface text-green" : "border-border text-ink")}>
          <IconUserPlus size={15} /> {t({ ka: "ლიდი", en: "Lead" })}
        </button>
        <button type="button" onClick={() => setOrder((v) => !v)} className={clsx(MARK, order ? "border-blue bg-blue-surface text-blue" : "border-border text-ink")}>
          <IconShoppingCart size={15} /> {t({ ka: "შეკვეთა", en: "Order" })}
        </button>
        <span className={clsx("flex items-center gap-2 rounded-[6px] border border-border px-2.5 py-1.5 text-xs font-medium", ai ? "bg-ai-surface" : "bg-soft")}>
          <IconRobot size={15} className="text-ai" /> AI
          <Switch on={ai} onToggle={() => setAi((v) => !v)} tone="ai" ariaLabel="AI" />
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-soft p-4">
        {THREAD.map((m, i) => (
          <div
            key={i}
            className={clsx(
              "max-w-[80%] rounded-[13px] px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[70%]",
              m.from === "customer" && "self-start rounded-tl-[4px] border border-border bg-surface",
              m.from === "ai" && "ml-auto self-end rounded-tr-[4px] border border-ai bg-ai-surface",
              m.from === "admin" && "ml-auto self-end rounded-tr-[4px] bg-primary text-white",
            )}
          >
            {m.from === "ai" ? <span className="mb-1 block text-[10px] font-semibold text-ai">✦ {t({ ka: "AI პასუხი", en: "AI reply" })}</span> : null}
            {m.from === "admin" ? <span className="mb-1 block text-[10px] font-semibold opacity-80">{t({ ka: "ადმინი (ხელით)", en: "Admin (manual)" })}</span> : null}
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2.5 border-t border-border2 p-3">
        <input
          placeholder={t({ ka: "დაწერე პასუხი (ბოტი შეჩერდება)...", en: "Type a reply (bot pauses)..." })}
          className="min-w-0 flex-1 rounded-[6px] border border-border bg-soft px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
        />
        <button type="button" className="inline-flex h-[38px] items-center gap-1.5 rounded-[6px] bg-primary px-4 text-sm font-medium text-white">
          <IconSend size={16} /> {t({ ka: "გაგზავნა", en: "Send" })}
        </button>
      </div>
    </div>
  );
}
