"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconMail, IconTrash, IconX } from "@tabler/icons-react";
import { removeTeamMember, updateMemberRole } from "@/lib/dashboard/actions/team";
import { resendTeamInvite } from "@/lib/dashboard/actions/teamInvite";
import type { TeamMember } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { RoleOptions } from "./RoleOptions";
import { ERRORS, ROLE, type Role } from "./teamMessages";
import type { TeamRun } from "./useTeamRun";

const ACTION = "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] hover:bg-soft disabled:opacity-40";

export function MemberMenu({
  member: m,
  grantable,
  isSelf,
  pending,
  run,
  onClose,
}: {
  member: TeamMember;
  grantable: Role[];
  isSelf: boolean;
  pending: boolean;
  run: TeamRun;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const act = (fn: Parameters<TeamRun>[0]) => {
    setError(null);
    run(fn, onClose, setError);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="dash-scope fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 text-ink" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-[14px] border border-border bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${ROLE[m.role].avatar}`}>
            {(m.user.name ?? m.user.email)[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="member-dialog-title" className="truncate text-[15px] font-semibold">{m.user.name ?? m.user.email}</h2>
            <p className="truncate text-xs text-muted">{m.user.email}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("dashboard.team.view.close")} className="grid size-8 shrink-0 place-items-center rounded-[6px] border border-border text-muted hover:text-ink">
            <IconX size={18} />
          </button>
        </div>

        <RoleOptions
          roles={grantable}
          current={m.role}
          disabled={pending}
          onPick={(role) => act(() => updateMemberRole(m.id, role))}
        />

        <div className="border-t border-border p-3">
          {error ? (
            <p role="alert" className="px-3 pb-2 text-xs text-red">
              {t(ERRORS[error] ?? "dashboard.team.view.somethingWentWrong")}
            </p>
          ) : null}
          {isSelf ? null : (
            <button type="button" disabled={pending} onClick={() => act(() => resendTeamInvite(m.id))} className={ACTION}>
              <IconMail size={16} className="text-muted" />
              {t("dashboard.team.view.resendInvite")}
            </button>
          )}
          <button
            type="button"
            disabled={pending || isSelf}
            title={isSelf ? t("dashboard.team.view.youCanTRemove") : undefined}
            onClick={() => act(() => removeTeamMember(m.id))}
            className={`${ACTION} text-red`}
          >
            <IconTrash size={16} />
            {t("dashboard.team.view.removeFromTeam")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
