"use client";

import { IconDots } from "@tabler/icons-react";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import type { TeamMember } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { MemberMenu } from "./MemberMenu";
import { ROLE, type Role } from "./teamMessages";
import type { TeamRun } from "./useTeamRun";

export function MemberRow({
  member: m,
  isSelf,
  canManage,
  open,
  grantable,
  myRank,
  pending,
  run,
  onToggleMenu,
  onCloseMenu,
}: {
  member: TeamMember;
  isSelf: boolean;
  canManage: boolean;
  open: boolean;
  grantable: Role[];
  myRank: number;
  pending: boolean;
  run: TeamRun;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const { t } = useLanguage();
  const r = ROLE[m.role];

  return (
    <tr className="border-b border-border2 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${r.avatar}`}>
            {(m.user.name ?? m.user.email)[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium">
              {m.user.name ?? "—"}
              {isSelf ? <span className="ml-1.5 text-xs text-muted">({t("dashboard.team.view.you")})</span> : null}
            </div>
            <div className="truncate text-xs text-muted">{m.user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.pill}`}>{t(ROLE_LABEL[m.role])}</span>
      </td>
      <td className="px-4 py-3 text-muted">{t(r.perms)}</td>
      <td className="px-4 py-3 text-right">
        {canManage ? (
          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label={t("dashboard.team.view.actions")}
              aria-expanded={open}
              onClick={onToggleMenu}
              className="inline-grid size-8 place-items-center rounded-[6px] border border-border text-muted hover:border-blue hover:text-ink"
            >
              <IconDots size={16} />
            </button>

            {open ? (
              <MemberMenu
                member={m}
                grantable={grantable}
                myRank={myRank}
                isSelf={isSelf}
                pending={pending}
                run={run}
                onDone={onCloseMenu}
              />
            ) : null}
          </div>
        ) : null}
      </td>
    </tr>
  );
}
