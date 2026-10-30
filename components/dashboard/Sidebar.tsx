"use client";

import clsx from "clsx";
import { Wordmark } from "@/components/ui/Wordmark";
import { NavList } from "./NavList";
import { ProfileMenu } from "./ProfileMenu";
import type { Account } from "@/lib/dashboard/queries/account";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROLE } from "./team/teamMessages";

export function Sidebar({ className, account }: { className?: string; account: Account }) {
  const { t } = useLanguage();
  const role = account.businesses.find((b) => b.id === account.businessId)?.role;

  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen w-[250px] shrink-0 flex-col border-r border-border bg-surface",
        className,
      )}
    >
      <div className="flex h-[60px] items-center gap-2.5 border-b border-border2 px-[18px] text-base font-semibold">
        <Wordmark className="h-[28px]" tagline />
        {role ? (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE[role].pill}`}>{t(ROLE_LABEL[role])}</span>
        ) : null}
      </div>
      <NavList locked={!account.activated} />
      <ProfileMenu account={account} />
    </aside>
  );
}
