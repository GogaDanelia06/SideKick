"use client";

import { IconCircleFilled, IconRobot } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { CHAT } from "@/lib/content/chat";
import { BRAND } from "@/lib/content/common";
import { useLanguage } from "@/lib/i18n/useLanguage";

const COPY = {
  q1: { ka: "iPhone 15 Pro გაქვთ მარაგში? 📱", en: "Do you have the iPhone 15 Pro in stock? 📱" },
  a1: { ka: "დიახ! ხელმისაწვდომია — 3,500₾. გსურთ შეკვეთის გაფორმება?", en: "Yes! It's available — ₾3,500. Would you like to place an order?" },
  q2: { ka: "კი, მინდა შევუკვეთო", en: "Yes, I'd like to order" },
  leadTag: { ka: "✦ AI — ლიდად მონიშნა", en: "✦ AI — tagged as a lead" },
  a2: { ka: "შესანიშნავი! მომწერეთ სახელი და ტელეფონი მიწოდებისთვის.", en: "Great! Send me your name and phone number for delivery." },
};

const INCOMING = "max-w-[80%] self-start rounded-[13px] rounded-tl-[4px] border border-border bg-card2 px-[13px] py-2.5 text-sm leading-[1.5]";
const OUTGOING = "max-w-[80%] self-end rounded-[13px] rounded-tr-[4px] bg-primary px-[13px] py-2.5 text-sm leading-[1.5] text-white";

export function ChatMock() {
  const { t } = useLanguage();
  return (
    <Card className="rounded-lg p-[18px]">
      <div className="mb-3.5 flex items-center gap-2.5 border-b border-border pb-3.5">
        <span className="grid size-[34px] place-items-center rounded-full bg-blue-surface text-blue">
          <IconRobot size={17} />
        </span>
        <div>
          <div className="text-sm font-semibold">{BRAND} AI</div>
          <div className="flex items-center gap-1 text-[12px] text-muted">
            <IconCircleFilled size={8} className="text-green" />
            {t(CHAT.onlineDetailed)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className={INCOMING}>{t(COPY.q1)}</div>
        <div className={OUTGOING}>{t(COPY.a1)}</div>
        <div className={INCOMING}>{t(COPY.q2)}</div>
        <div className="max-w-[80%] self-start rounded-[13px] rounded-tl-[4px] border border-blue-ring bg-blue-surface px-[13px] py-2.5 text-sm leading-[1.5] text-blue-ink">
          <span className="mb-[3px] block text-[10px] font-semibold opacity-80">{t(COPY.leadTag)}</span>
          {t(COPY.a2)}
        </div>
      </div>
    </Card>
  );
}
