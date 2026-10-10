import type { Lead } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export type LeadStatus = Lead["status"];

export const STATUS: Record<LeadStatus, { label: Text; cls: string }> = {
  NEW: { label: "dashboard.leads.view.new", cls: "bg-blue-surface text-blue" },
  ACTIVE: { label: "dashboard.leads.view.active", cls: "bg-amber-surface text-amber" },
  CLOSED: { label: "dashboard.leads.view.closed", cls: "bg-green-surface text-green" },
};

export const STATUSES: LeadStatus[] = ["NEW", "ACTIVE", "CLOSED"];

export const COLUMNS: Text[] = [
  "dashboard.leads.view.name",
  "dashboard.leads.view.phone",
  "dashboard.leads.view.interest",
  "dashboard.leads.view.source",
  "dashboard.leads.view.status",
  "dashboard.leads.view.comment",
];

export const INPUT =
  "h-9 w-full rounded-[8px] border border-input bg-surface px-3 text-sm outline-none focus:border-blue";
