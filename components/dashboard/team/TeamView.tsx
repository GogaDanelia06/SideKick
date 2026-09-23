"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { IconAlertTriangle, IconDots, IconPlus, IconTrash, IconUserCog, IconX } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useToast } from "@/components/dashboard/ui/Toast";
import { addTeamMember, removeTeamMember, updateMemberRole } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import type { TeamMember } from "@/lib/dashboard/queries";
import { ERRORS, RANK, ROLE, ROLES, TEAM_SAVED, type Role } from "./teamMessages";

type Member = TeamMember;

export function TeamView({
  members,
  currentUserId,
  currentRole,
}: {
  members: Member[];
  currentUserId: string;
  currentRole: string;
}) {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);

  /** Only roles this member may assign are offered; the server enforces the same rule. */
  const myRank = RANK[currentRole as Role] ?? -1;
  const grantable = ROLES.filter((r) => RANK[r] <= myRank);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) return setError(res.error ?? "unknown");
      notify(t(TEAM_SAVED));
      after?.();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-amber px-3 py-1 text-xs font-medium text-amber">
          {t("dashboard.team.view.secondStage")}
        </span>
        {canManage ? (
          <button
            type="button"
            onClick={() => { setAdding(true); setError(null); }}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <IconPlus size={16} />
            {t("dashboard.team.view.addMember")}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? "dashboard.team.view.somethingWentWrong")}
        </div>
      ) : null}

      {adding ? (
        <Panel className="p-4">
          <form
            ref={formRef}
            action={(fd) =>
              run(() => addTeamMember(fd), () => { formRef.current?.reset(); setAdding(false); })
            }
            className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto]"
          >
            <input
              name="name"
              placeholder={t("dashboard.team.view.fullName")}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
            />
            <input
              name="email"
              type="email"
              required
              placeholder={t("dashboard.team.view.email")}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
            />
            <select
              name="role"
              defaultValue="OPERATOR"
              aria-label={t("dashboard.team.view.role")}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none focus:border-blue"
            >
              {grantable.map((r) => <option key={r} value={r}>{t(ROLE_LABEL[r])}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="h-10 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
              >
                {pending ? "…" : t("dashboard.team.view.add")}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setError(null); }}
                aria-label={t("dashboard.team.view.cancel")}
                className="grid size-10 place-items-center rounded-[8px] border border-border text-muted"
              >
                <IconX size={16} />
              </button>
            </div>
          </form>
          <p className="mt-2.5 text-xs text-muted">
            {t("dashboard.team.view.theMemberIsAdded")}
          </p>
        </Panel>
      ) : null}

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-semibold">{t("dashboard.team.view.member")}</th>
              <th className="px-4 py-3 font-semibold">{t("dashboard.team.view.role")}</th>
              <th className="px-4 py-3 font-semibold">{t("dashboard.team.view.permissions")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const r = ROLE[m.role];
              const isSelf = m.userId === currentUserId;
              const open = menuFor === m.id;
              return (
                <tr key={m.id} className="border-b border-border2 last:border-0">
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
                          onClick={() => setMenuFor(open ? null : m.id)}
                          className="inline-grid size-8 place-items-center rounded-[6px] border border-border text-muted hover:border-blue hover:text-ink"
                        >
                          <IconDots size={16} />
                        </button>

                        {open ? (
                          <div className="absolute right-0 z-30 mt-1 w-56 rounded-[10px] border border-border bg-surface p-1.5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-faint">
                              <IconUserCog size={13} /> {t("dashboard.team.view.changeRole")}
                            </div>
                            {grantable.map((role) => (
                              <button
                                key={role}
                                type="button"
                                disabled={pending || role === m.role || RANK[m.role] > myRank}
                                onClick={() => run(() => updateMemberRole(m.id, role), () => setMenuFor(null))}
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
                              onClick={() => run(() => removeTeamMember(m.id), () => setMenuFor(null))}
                              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-[13px] text-red hover:bg-soft disabled:opacity-40"
                            >
                              <IconTrash size={15} />
                              {t("dashboard.team.view.removeFromTeam")}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => (
          <Panel key={r} className="p-4">
            <div className={`text-sm font-semibold ${ROLE[r].title}`}>{t(ROLE_LABEL[r])}</div>
            <p className="mt-1.5 text-xs text-muted">{t(ROLE[r].desc)}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
