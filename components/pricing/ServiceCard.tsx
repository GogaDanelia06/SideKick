"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Service } from "@/lib/content/services";

export function ServiceCard({ service }: { service: Service }) {
  const { t } = useLanguage();

  return (
    <Card className="p-[22px]">
      <div className="flex items-center gap-3">
        <div className="grid size-[42px] shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
          <service.icon size={21} />
        </div>
        <h3 className="flex-1 text-base font-semibold">{t(service.title)}</h3>
      </div>
      <div className="mt-3.5 whitespace-pre-line border-t border-border pt-3.5 text-sm leading-[1.7] text-muted">
        {t(service.desc)}
      </div>
    </Card>
  );
}
