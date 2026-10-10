"use client";

import type { Lead } from "@prisma/client";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { COLUMNS, type LeadStatus } from "./leadConfig";
import { LeadRow } from "./LeadRow";

export function LeadsTable({
  leads,
  pending,
  onStatus,
  onRemove,
}: {
  leads: Lead[];
  pending: boolean;
  onStatus: (id: string, status: LeadStatus) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <Panel className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
            {COLUMNS.map((c, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {t(c)}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <LeadRow
              key={l.id}
              lead={l}
              pending={pending}
              onStatus={(status) => onStatus(l.id, status)}
              onRemove={() => onRemove(l.id)}
            />
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted">
                {t("dashboard.leads.view.noLeadsYet")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Panel>
  );
}
