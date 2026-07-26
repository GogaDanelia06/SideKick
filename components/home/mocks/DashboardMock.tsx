"use client";

import clsx from "clsx";
import {
  IconCash,
  IconChartBar,
  IconLayoutDashboard,
  IconMessage2,
  IconMessages,
  IconPackage,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/useLanguage";

const RAIL = [IconLayoutDashboard, IconMessages, IconChartBar, IconPackage, IconSettings];
const BARS = [42, 58, 50, 72, 64, 88, 100];
const STAT_CARDS = [
  { icon: IconMessage2, label: { ka: "ჩათები", en: "Chats" }, value: "8,540" },
  { icon: IconUserPlus, label: { ka: "ლიდები", en: "Leads" }, value: "312" },
  { icon: IconCash, label: { ka: "გაყიდვა", en: "Sales" }, value: "48K", unit: "₾" },
];

export function DashboardMock() {
  const { t } = useLanguage();
  return (
    <Card className="grid grid-cols-[64px_1fr] gap-4 rounded-lg p-4">
      <div className="flex flex-col items-center gap-3.5 rounded-md border border-border bg-card2 py-3">
        {RAIL.map((Icon, i) => (
          <span
            key={i}
            className={clsx(
              "grid size-[22px] place-items-center rounded-md",
              i === 0 ? "bg-primary text-white" : "text-muted",
            )}
          >
            <Icon size={16} />
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-3 gap-2.5">
          {STAT_CARDS.map((s) => (
            <div key={s.value} className="rounded-md border border-border bg-card2 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <s.icon size={13} className="text-green" />
                {t(s.label)}
              </div>
              <div className="mt-1.5 font-mono text-base font-medium sm:text-xl">
                {s.value}
                {s.unit ? <b className="font-medium text-green">{s.unit}</b> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border bg-card2 px-3.5 pb-3 pt-3.5">
          <div className="mb-3 flex items-center justify-between text-[12px] text-muted">
            <span>{t({ ka: "გაყიდვები / კვირა", en: "Sales / week" })}</span>
            <b className="font-mono font-medium text-ink">+18%</b>
          </div>
          <div className="flex h-20 items-end gap-2">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t bg-primary opacity-85"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
