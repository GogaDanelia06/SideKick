import { useState, useTransition } from "react";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { TEAM_SAVED } from "./teamMessages";

export type TeamResult = { ok: boolean; error?: string; emailed?: boolean };

export type TeamRun = (fn: () => Promise<TeamResult>, after?: () => void, failed?: (error: string) => void) => void;

export function useTeamRun() {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run: TeamRun = (fn, after, failed) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) return (failed ?? setError)(res.error ?? "unknown");
      if (res.emailed === false) notify(t("dashboard.team.messages.addedNoEmail"), "error");
      else notify(t(res.emailed ? "dashboard.team.messages.inviteSent" : TEAM_SAVED));
      after?.();
    });
  };

  return { pending, error, setError, run };
}
