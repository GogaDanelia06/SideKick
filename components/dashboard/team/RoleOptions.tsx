"use client";

import { IconCheck } from "@tabler/icons-react";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ROLE, type Role } from "./teamMessages";

export function RoleOptions({
  roles,
  current,
  disabled,
  onPick,
}: {
  roles: Role[];
  current: Role;
  disabled: boolean;
  onPick: (role: Role) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="p-3">
      <div className="px-3 pb-1.5 text-[11px] uppercase tracking-wide text-faint">{t("dashboard.team.view.changeRole")}</div>
      {roles.map((role) => {
        const active = role === current;
        return (
          <button
            key={role}
            type="button"
            aria-pressed={active}
            disabled={disabled || active}
            onClick={() => onPick(role)}
            className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left disabled:cursor-default ${active ? "bg-soft" : "hover:bg-soft"} ${!active && disabled ? "opacity-40" : ""}`}
          >
            <span className="min-w-0 flex-1">
              <span className={`block text-[13px] font-medium ${ROLE[role].title}`}>{t(ROLE_LABEL[role])}</span>
              <span className="block text-xs text-muted">{t(ROLE[role].desc)}</span>
            </span>
            {active ? <IconCheck size={16} className="shrink-0 text-green" /> : null}
          </button>
        );
      })}
    </div>
  );
}
