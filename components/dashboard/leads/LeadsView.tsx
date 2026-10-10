"use client";

import { useState } from "react";
import type { Lead } from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AddLeadForm } from "./AddLeadForm";
import { LeadsTable } from "./LeadsTable";
import { useLeadSaves } from "./useLeadSaves";

export function LeadsView({ leads }: { leads: Lead[] }) {
  const { t } = useLanguage();
  const { pending, add, setStatus, remove } = useLeadSaves();
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">
          {leads.length} {t("dashboard.leads.view.leads")}
        </span>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white"
        >
          {adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {adding ? t("dashboard.leads.view.close") : t("dashboard.leads.view.addLead")}
        </button>
      </div>

      {adding ? <AddLeadForm pending={pending} add={add} onDone={() => setAdding(false)} /> : null}

      <LeadsTable leads={leads} pending={pending} onStatus={setStatus} onRemove={remove} />
    </div>
  );
}
