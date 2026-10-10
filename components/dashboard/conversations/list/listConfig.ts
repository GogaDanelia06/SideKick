import { IconCreditCard, IconExclamationMark, IconRobotOff } from "@tabler/icons-react";
import type { ConversationRow } from "@/lib/dashboard/queries";
import type { IconType } from "@/lib/content/types";
import { phrase, type Text } from "@/lib/i18n/messages";

export const RING: Record<ConversationRow["ring"], string> = {
  lead: "border-amber",
  order: "border-green",
  none: "border-border",
};

export const ALERT: Record<"wait" | "aierr" | "aioff" | "billing", { icon: IconType; cls: string }> = {
  wait: { icon: IconExclamationMark, cls: "bg-red-surface text-red" },
  aierr: { icon: IconExclamationMark, cls: "bg-amber-surface text-amber" },
  aioff: { icon: IconRobotOff, cls: "bg-soft text-muted" },
  billing: { icon: IconCreditCard, cls: "bg-blue-surface text-blue" },
};

export const LEGEND: { cls: string; icon?: IconType; label: Text }[] = [
  { cls: RING.lead, label: "dashboard.conversations.chatList.lead" },
  { cls: RING.order, label: "dashboard.conversations.chatList.order" },
  { cls: ALERT.wait.cls, icon: ALERT.wait.icon, label: "dashboard.conversations.chatList.waitingForAHuman" },
  { cls: ALERT.aierr.cls, icon: ALERT.aierr.icon, label: "dashboard.conversations.chatList.aiError" },
  { cls: ALERT.aioff.cls, icon: ALERT.aioff.icon, label: "dashboard.conversations.chatList.aiOff" },
  { cls: ALERT.billing.cls, icon: ALERT.billing.icon, label: "dashboard.conversations.chatList.planSpentOrLapsed" },
];

export function ago(mins: number): Text {
  if (mins < 1) return "dashboard.conversations.chatList.now";
  if (mins < 60) return phrase("dashboard.conversations.chatList.minutes", { min: mins });
  const h = Math.floor(mins / 60);
  if (h < 24) return phrase("dashboard.conversations.chatList.hours", { h });
  return phrase("dashboard.conversations.chatList.days", { d: Math.floor(h / 24) });
}
