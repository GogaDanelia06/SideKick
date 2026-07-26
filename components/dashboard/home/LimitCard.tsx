"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { LIMIT_LABELS } from "@/lib/dashboard/home";
import type { HomeOverview } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function LimitCard({ limit }: { limit: HomeOverview["limit"] }) {
  const { t, locale } = useLanguage();

  if (!limit) {
    return (
      <Panel className="p-5">
        <h3 className="mb-3.5 text-[15px] font-semibold">{t(LIMIT_LABELS.heading)}</h3>
        <p className="text-sm text-muted">{t(LIMIT_LABELS.noPlan)}</p>
      </Panel>
    );
  }

  const unlimited = limit.total < 0;
  const remaining = unlimited ? 0 : Math.max(0, limit.total - limit.used);
  const percent = unlimited || limit.total === 0 ? 0 : Math.min(100, Math.round((limit.used / limit.total) * 100));
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <Panel className="p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{t(LIMIT_LABELS.heading)}</h3>
        <span className="shrink-0 text-xs text-muted">
          {limit.planName}
          {unlimited ? ` · ${t(LIMIT_LABELS.unlimited)}` : ` · ${fmt(limit.total)}`}
        </span>
      </div>
      <div className="mb-2.5 flex items-end gap-2">
        <span className="font-mono text-[30px] font-semibold">
          {unlimited ? "∞" : fmt(remaining)}
        </span>
        <span className="mb-1.5 text-[13px] text-muted">
          {t(LIMIT_LABELS.left)} · {fmt(limit.used)} {t(LIMIT_LABELS.used)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-border2 bg-soft">
        <span className="block h-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-faint">
        <span>0</span>
        {limit.renewsAt ? (
          <span>
            {t(LIMIT_LABELS.renews)}{" "}
            {new Date(limit.renewsAt).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-US", {
              day: "numeric",
              month: "long",
            })}
          </span>
        ) : (
          <span>{unlimited ? "" : fmt(limit.total)}</span>
        )}
      </div>
    </Panel>
  );
}
