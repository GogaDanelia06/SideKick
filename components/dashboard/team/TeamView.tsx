"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { TeamMember } from "@/lib/dashboard/queries";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AddMemberForm } from "./AddMemberForm";
import { MembersTable } from "./MembersTable";
import { RoleCards } from "./RoleCards";
import { ERRORS, RANK, ROLES, type Role } from "./teamMessages";
import { useTeamRun } from "./useTeamRun";

export function TeamView({
  members,
  currentUserId,
  currentRole,
}: {
  members: TeamMember[];
  currentUserId: string;
  currentRole: string;
}) {
  const { t } = useLanguage();
  const team = useTeamRun();
  const [adding, setAdding] = useState(false);

  const myRank = RANK[currentRole as Role] ?? -1;
  const grantable = ROLES.filter((r) => RANK[r] <= myRank);
  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-amber px-3 py-1 text-xs font-medium text-amber">
          {t("dashboard.team.view.secondStage")}
        </span>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              team.setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <IconPlus size={16} />
            {t("dashboard.team.view.addMember")}
          </button>
        ) : null}
      </div>

      {team.error ? (
        <ErrorBanner>{t(ERRORS[team.error] ?? "dashboard.team.view.somethingWentWrong")}</ErrorBanner>
      ) : null}

      {adding ? (
        <AddMemberForm
          grantable={grantable}
          pending={team.pending}
          run={team.run}
          onAdded={() => setAdding(false)}
          onCancel={() => {
            setAdding(false);
            team.setError(null);
          }}
        />
      ) : null}

      <MembersTable
        members={members}
        currentUserId={currentUserId}
        canManage={canManage}
        grantable={grantable}
        myRank={myRank}
        pending={team.pending}
        run={team.run}
      />
      <RoleCards />
    </div>
  );
}
