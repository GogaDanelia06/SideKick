"use client";

import { useRef } from "react";
import { IconX } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { addTeamMember } from "@/lib/dashboard/actions/teamInvite";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Role } from "./teamMessages";
import type { TeamRun } from "./useTeamRun";

const FIELD =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none focus:border-blue";

export function AddMemberForm({
  grantable,
  pending,
  run,
  onAdded,
  onCancel,
}: {
  grantable: Role[];
  pending: boolean;
  run: TeamRun;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Panel className="p-4">
      <form
        ref={formRef}
        action={(fd) =>
          run(() => addTeamMember(fd), () => {
            formRef.current?.reset();
            onAdded();
          })
        }
        className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto]"
      >
        <input name="name" placeholder={t("dashboard.team.view.fullName")} className={`${FIELD} placeholder:text-faint`} />
        <input
          name="email"
          type="email"
          required
          placeholder={t("dashboard.team.view.email")}
          className={`${FIELD} placeholder:text-faint`}
        />
        <select name="role" defaultValue="OPERATOR" aria-label={t("dashboard.team.view.role")} className={FIELD}>
          {grantable.map((r) => (
            <option key={r} value={r}>
              {t(ROLE_LABEL[r])}
            </option>
          ))}
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
            onClick={onCancel}
            aria-label={t("dashboard.team.view.cancel")}
            className="grid size-10 place-items-center rounded-[8px] border border-border text-muted"
          >
            <IconX size={16} />
          </button>
        </div>
      </form>
      <p className="mt-2.5 text-xs text-muted">{t("dashboard.team.view.theMemberIsAdded")}</p>
    </Panel>
  );
}
