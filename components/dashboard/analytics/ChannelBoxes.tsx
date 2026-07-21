"use client";

import { IconCash, IconShoppingCart, IconUserPlus } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { CHANNEL_META } from "./ChannelFilter";
import type { AnalyticsData } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

type Row = AnalyticsData["channels"][number];
const BOXES: { key: "revenue" | "orders" | "leads"; label: Bilingual; icon: IconType; money?: boolean }[] = [
  { key: "revenue", label: { ka: "შემოსავალი", en: "Revenue" }, icon: IconCash, money: true },
  { key: "orders", label: { ka: "შეკვეთები", en: "Orders" }, icon: IconShoppingCart },
  { key: "leads", label: { ka: "ლიდები", en: "Leads" }, icon: IconUserPlus },
];

export function ChannelBoxes({ channels }: { channels: Row[] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {BOXES.map((box) => {
        const rows = [...channels].sort((a, b) => b[box.key] - a[box.key]);
        const max = Math.max(1, ...rows.map((r) => r[box.key]));
        const total = rows.reduce((n, r) => n + r[box.key], 0);

        return (
          <Panel key={box.key} className="p-5">
            <h3 className="mb-3.5 flex items-center gap-2 text-[15px] font-semibold">
              <box.icon size={17} className="text-muted" />
              {t(box.label)}
            </h3>

            {total === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                {t({ ka: "მონაცემი არ არის", en: "No data" })}
              </p>
            ) : (
              <div className="grid gap-3">
                {rows.map((r) => {
                  const m = CHANNEL_META[r.type];
                  const v = r[box.key];
                  return (
                    <div key={r.type} className="grid gap-1.5">
                      <div className="flex items-center gap-2 text-[13px]">
                        <m.icon size={15} style={{ color: m.color }} />
                        <span className="flex-1">{m.name}</span>
                        <span className="font-mono font-medium">
                          {v.toLocaleString("en-US")}{box.money ? "₾" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(v / max) * 100}%`, background: m.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
