"use client";

import Link from "next/link";
import type { Lead } from "@prisma/client";
import { IconMessage } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const STATUS: Record<Lead["status"], { label: Bilingual; cls: string }> = {
  NEW: { label: { ka: "ახალი", en: "New" }, cls: "bg-blue-surface text-blue" },
  ACTIVE: { label: { ka: "მიმდინარე", en: "Active" }, cls: "bg-amber-surface text-amber" },
  CLOSED: { label: { ka: "დახურული", en: "Closed" }, cls: "bg-green-surface text-green" },
};

export function LeadsView({ leads }: { leads: Lead[] }) {
  const { t } = useLanguage();
  const cols: Bilingual[] = [
    { ka: "სახელი გვარი", en: "Name" }, { ka: "ტელეფონი", en: "Phone" }, { ka: "ინტერესი", en: "Interest" },
    { ka: "წყარო", en: "Source" }, { ka: "სტატუსი", en: "Status" }, { ka: "კომენტარი", en: "Comment" },
  ];

  return (
    <Panel className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
            {cols.map((c, i) => <th key={i} className="px-4 py-3 font-semibold">{t(c)}</th>)}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const st = STATUS[l.status];
            return (
              <tr key={l.id} className="border-b border-border2 last:border-0">
                <td className="px-4 py-3 font-medium">{l.name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{l.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{l.interest ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{l.source ?? "—"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{t(st.label)}</span></td>
                <td className="px-4 py-3 text-muted">{l.comment || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={DASH.conversations} aria-label={t({ ka: "მიმოწერაზე გადასვლა", en: "Go to chat" })} className="inline-grid size-8 place-items-center rounded-[6px] border border-border bg-surface text-blue hover:border-blue">
                    <IconMessage size={16} />
                  </Link>
                </td>
              </tr>
            );
          })}
          {leads.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">{t({ ka: "ლიდები ჯერ არ არის", en: "No leads yet" })}</td></tr>
          )}
        </tbody>
      </table>
    </Panel>
  );
}
