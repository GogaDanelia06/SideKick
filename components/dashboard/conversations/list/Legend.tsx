"use client";

import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { LEGEND } from "./listConfig";

export function Legend() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border2 px-3 py-2">
      {LEGEND.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          {item.icon ? (
            <span className={clsx("grid size-[14px] place-items-center rounded-full", item.cls)}>
              <item.icon size={9} />
            </span>
          ) : (
            <span className={clsx("size-[11px] rounded-full border-2", item.cls)} />
          )}
          {t(item.label)}
        </span>
      ))}
    </div>
  );
}
