import type { PaymentStatus } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export const STATUS: Record<PaymentStatus, { label: Text; tone: string }> = {
  PAID: { label: "dashboard.billing.view.paid", tone: "bg-green-surface text-green" },
  PENDING: { label: "dashboard.billing.view.pending", tone: "bg-soft text-muted" },
  FAILED: { label: "dashboard.billing.view.failed", tone: "bg-red-surface text-red" },
  EXPIRED: { label: "dashboard.billing.view.expired", tone: "bg-soft text-muted" },
};

export const SUB_STATUS: Record<string, Text> = {
  TRIAL: "dashboard.billing.view.trial",
  ACTIVE: "dashboard.billing.view.active",
  PAST_DUE: "dashboard.billing.view.pastDue",
  CANCELLED: "dashboard.billing.view.cancelled",
};
