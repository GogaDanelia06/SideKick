"use client";

import { IconLock } from "@tabler/icons-react";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export const lockedOut = (activated: boolean, pathname: string) =>
  !activated && pathname !== DASH.billing && !pathname.startsWith(`${DASH.billing}/`);

export function ActivatePlan({ owner }: { owner: boolean }) {
  const { t } = useLanguage();

  return (
    <div role="status" className="flex items-start gap-3 rounded-[12px] border border-amber/40 bg-amber-surface p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-surface text-amber">
        <IconLock size={18} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold">{t("dashboard.billing.locked.title")}</h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {t(owner ? "dashboard.billing.locked.ownerBody" : "dashboard.billing.locked.memberBody")}
        </p>
      </div>
    </div>
  );
}
