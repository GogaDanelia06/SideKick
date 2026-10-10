"use client";

import { Panel } from "@/components/dashboard/ui/Panel";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROLE, ROLES } from "./teamMessages";

export function RoleCards() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ROLES.map((r) => (
        <Panel key={r} className="p-4">
          <div className={`text-sm font-semibold ${ROLE[r].title}`}>{t(ROLE_LABEL[r])}</div>
          <p className="mt-1.5 text-xs text-muted">{t(ROLE[r].desc)}</p>
        </Panel>
      ))}
    </div>
  );
}
