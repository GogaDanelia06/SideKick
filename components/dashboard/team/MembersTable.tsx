"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/ui/Panel";
import type { TeamMember } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { MemberRow } from "./MemberRow";
import type { Role } from "./teamMessages";
import type { TeamRun } from "./useTeamRun";

const HEAD = "px-4 py-3 font-semibold";

export function MembersTable({
  members,
  currentUserId,
  canManage,
  grantable,
  myRank,
  pending,
  run,
}: {
  members: TeamMember[];
  currentUserId: string;
  canManage: boolean;
  grantable: Role[];
  myRank: number;
  pending: boolean;
  run: TeamRun;
}) {
  const { t } = useLanguage();
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  return (
    <Panel className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
            <th className={HEAD}>{t("dashboard.team.view.member")}</th>
            <th className={HEAD}>{t("dashboard.team.view.role")}</th>
            <th className={HEAD}>{t("dashboard.team.view.permissions")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isSelf={m.userId === currentUserId}
              canManage={canManage}
              open={menuFor === m.id}
              grantable={grantable}
              myRank={myRank}
              pending={pending}
              run={run}
              onToggleMenu={() => setMenuFor(menuFor === m.id ? null : m.id)}
              onCloseMenu={() => setMenuFor(null)}
            />
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
