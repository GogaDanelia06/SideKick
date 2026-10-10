"use client";

import Link from "next/link";
import type { Lead } from "@prisma/client";
import { IconMessage, IconTrash } from "@tabler/icons-react";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { STATUS, STATUSES, type LeadStatus } from "./leadConfig";

export function LeadRow({
  lead: l,
  pending,
  onStatus,
  onRemove,
}: {
  lead: Lead;
  pending: boolean;
  onStatus: (status: LeadStatus) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();

  return (
    <tr className="border-b border-border2 last:border-0">
      <td className="px-4 py-3 font-medium">{l.name ?? "—"}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{l.phone ?? "—"}</td>
      <td className="px-4 py-3 text-muted">{l.interest ?? "—"}</td>
      <td className="px-4 py-3 text-muted">{l.source ?? "—"}</td>
      <td className="px-4 py-3">
        <select
          value={l.status}
          disabled={pending}
          onChange={(e) => onStatus(e.target.value as LeadStatus)}
          aria-label={t("dashboard.leads.view.status")}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none ${STATUS[l.status].cls}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(STATUS[s].label)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-muted">{l.comment || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={DASH.conversations}
            aria-label={t("dashboard.leads.view.goToChat")}
            className="inline-grid size-8 place-items-center rounded-[6px] border border-border bg-surface text-blue hover:border-blue"
          >
            <IconMessage size={16} />
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={onRemove}
            aria-label={t("dashboard.leads.view.delete")}
            className="inline-grid size-8 place-items-center rounded-[6px] border border-border bg-surface text-red hover:border-red disabled:opacity-60"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
