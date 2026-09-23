"use client";

import { useTransition } from "react";
import type { Lead } from "@prisma/client";
import { useToast } from "@/components/dashboard/ui/Toast";
import { createLead, deleteLead, setLeadStatus } from "@/lib/dashboard/actions/leads";
import type { ActionResult } from "@/lib/dashboard/actions/result";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const ADDED: Text = "dashboard.leads.useLeadSaves.leadAdded";
const CHANGED: Text = "dashboard.leads.useLeadSaves.statusChanged";
const DELETED: Text = "dashboard.leads.useLeadSaves.leadDeleted";

const TROUBLE: Record<string, Text> = {
  forbidden: "dashboard.leads.useLeadSaves.youMayNotChange",
  name: "dashboard.leads.useLeadSaves.enterAName",
  failed: "dashboard.leads.useLeadSaves.couldnTSaveTry",
};

/** Every change to a lead, each one saying out loud how it went. */
export function useLeadSaves() {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();

  const run = (done: Text, act: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const result = await act().catch((): ActionResult => ({ ok: false, error: "failed" }));
      if (!result.ok) return notify(t(TROUBLE[result.error] ?? TROUBLE.failed), "error");
      notify(t(done));
      after?.();
    });

  return {
    pending,
    add: (fd: FormData, after: () => void) => run(ADDED, () => createLead(fd), after),
    setStatus: (id: string, status: Lead["status"]) => run(CHANGED, () => setLeadStatus(id, status)),
    remove: (id: string) => run(DELETED, () => deleteLead(id)),
  };
}
