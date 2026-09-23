"use client";

import { useTransition } from "react";
import type { Lead } from "@prisma/client";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { Bilingual } from "@/lib/content/types";
import { createLead, deleteLead, setLeadStatus } from "@/lib/dashboard/actions/leads";
import type { ActionResult } from "@/lib/dashboard/actions/result";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ADDED: Bilingual = { ka: "ლიდი დაემატა", en: "Lead added" };
const CHANGED: Bilingual = { ka: "სტატუსი შეიცვალა", en: "Status changed" };
const DELETED: Bilingual = { ka: "ლიდი წაიშალა", en: "Lead deleted" };

const TROUBLE: Record<string, Bilingual> = {
  forbidden: { ka: "ლიდების შეცვლის უფლება არ გაქვს", en: "You may not change leads" },
  name: { ka: "ჩაწერე სახელი", en: "Enter a name" },
  failed: { ka: "ვერ შეინახა — სცადე ხელახლა", en: "Couldn't save — try again" },
};

/** Every change to a lead, each one saying out loud how it went. */
export function useLeadSaves() {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();

  const run = (done: Bilingual, act: () => Promise<ActionResult>, after?: () => void) =>
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
