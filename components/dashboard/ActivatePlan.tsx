"use client";

import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { Panel } from "./ui/Panel";

const OPEN_WHEN_LOCKED = [DASH.billing, DASH.profile];

export const lockedOut = (activated: boolean, pathname: string) =>
  !activated && !OPEN_WHEN_LOCKED.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function ActivatePlan({ owner }: { owner: boolean }) {
  const { t } = useLanguage();

  return (
    <Panel className="mx-auto mt-6 grid max-w-[480px] justify-items-center gap-3 p-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-amber-surface text-amber">
        <IconLock size={24} />
      </span>
      <h2 className="text-lg font-semibold">{t("dashboard.billing.locked.title")}</h2>
      <p className="text-sm text-muted">
        {t(owner ? "dashboard.billing.locked.ownerBody" : "dashboard.billing.locked.memberBody")}
      </p>
      {owner ? (
        <Link
          href={DASH.billing}
          className="mt-2 inline-flex h-10 items-center rounded-[8px] bg-primary px-5 text-sm font-medium text-white"
        >
          {t("dashboard.billing.locked.choosePlan")}
        </Link>
      ) : null}
    </Panel>
  );
}
