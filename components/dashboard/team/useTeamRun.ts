import { useState, useTransition } from "react";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { TEAM_SAVED } from "./teamMessages";

export type TeamRun = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => void;

export function useTeamRun() {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run: TeamRun = (fn, after) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) return setError(res.error ?? "unknown");
      notify(t(TEAM_SAVED));
      after?.();
    });
  };

  return { pending, error, setError, run };
}
