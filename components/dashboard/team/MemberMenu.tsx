"use client";

import { IconTrash, IconUserCog } from "@tabler/icons-react";
import { removeTeamMember, updateMemberRole } from "@/lib/dashboard/actions/team";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import type { TeamMember } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { RANK, type Role } from "./teamMessages";
import type { TeamRun } from "./useTeamRun";

export function MemberMenu({
  member: m,
  grantable,
  myRank,
  isSelf,
  pending,
  run,
  onDone,
}: {
  member: TeamMember;
  grantable: Role[];
  myRank: number;
  isSelf: boolean;
  pending: boolean;
  run: TeamRun;
  onDone: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="absolute right-0 z-30 mt-1 w-56 rounded-[10px] border border-border bg-surface p-1.5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-faint">
        <IconUserCog size={13} /> {t("dashboard.team.view.changeRole")}
      </div>
      {grantable.map((role) => (
        <button
          key={role}
          type="button"
          disabled={pending || role === m.role || RANK[m.role] > myRank}
          onClick={() => run(() => updateMemberRole(m.id, role), onDone)}
          className="flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-[13px] hover:bg-soft disabled:opacity-40"
        >
          {t(ROLE_LABEL[role])}
          {role === m.role ? <span className="text-xs text-muted">✓</span> : null}
        </button>
      ))}
      <div className="my-1 border-t border-border2" />
      <button
        type="button"
        disabled={pending || isSelf}
        title={isSelf ? t("dashboard.team.view.youCanTRemove") : undefined}
        onClick={() => run(() => removeTeamMember(m.id), onDone)}
        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-[13px] text-red hover:bg-soft disabled:opacity-40"
      >
        <IconTrash size={15} />
        {t("dashboard.team.view.removeFromTeam")}
      </button>
    </div>
  );
}
