"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Lead } from "@prisma/client";
import { IconMessage, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useLeadSaves } from "./useLeadSaves";
import type { Text } from "@/lib/i18n/messages";

const STATUS: Record<Lead["status"], { label: Text; cls: string }> = {
  NEW: { label: "dashboard.leads.view.new", cls: "bg-blue-surface text-blue" },
  ACTIVE: { label: "dashboard.leads.view.active", cls: "bg-amber-surface text-amber" },
  CLOSED: { label: "dashboard.leads.view.closed", cls: "bg-green-surface text-green" },
};
const STATUSES: Lead["status"][] = ["NEW", "ACTIVE", "CLOSED"];

const INPUT =
  "h-9 w-full rounded-[8px] border border-input bg-surface px-3 text-sm outline-none focus:border-blue";

export function LeadsView({ leads }: { leads: Lead[] }) {
  const { t } = useLanguage();
  const { pending, add, setStatus, remove } = useLeadSaves();
  const [adding, setAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const cols: Text[] = [
    "dashboard.leads.view.name", "dashboard.leads.view.phone", "dashboard.leads.view.interest",
    "dashboard.leads.view.source", "dashboard.leads.view.status", "dashboard.leads.view.comment",
  ];

  function submit(formData: FormData) {
    add(formData, () => {
      formRef.current?.reset();
      setAdding(false);
    });
  }

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

      {adding ? (
        <Panel className="p-4">
          <form ref={formRef} action={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input name="name" required placeholder={t("dashboard.leads.view.name2")} className={INPUT} />
            <input name="phone" placeholder={t("dashboard.leads.view.phone")} className={INPUT} />
            <input name="interest" placeholder={t("dashboard.leads.view.interest")} className={INPUT} />
            <input name="source" placeholder={t("dashboard.leads.view.source")} className={INPUT} />
            <input
              name="comment"
              placeholder={t("dashboard.leads.view.comment")}
              className={`${INPUT} sm:col-span-2 lg:col-span-3`}
            />
            <button
              type="submit"
              disabled={pending}
              className="h-9 rounded-[8px] bg-primary text-[13px] font-medium text-white disabled:opacity-60"
            >
              {pending ? "…" : t("dashboard.leads.view.save")}
            </button>
          </form>
        </Panel>
      ) : null}

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
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
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      disabled={pending}
                      onChange={(e) => setStatus(l.id, e.target.value as Lead["status"])}
                      aria-label={t("dashboard.leads.view.status")}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none ${st.cls}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(STATUS[s].label)}</option>
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
                        onClick={() => remove(l.id)}
                        aria-label={t("dashboard.leads.view.delete")}
                        className="inline-grid size-8 place-items-center rounded-[6px] border border-border bg-surface text-red hover:border-red disabled:opacity-60"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
    </div>
  );
}
