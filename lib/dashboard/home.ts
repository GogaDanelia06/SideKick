import {
  IconCash,
  IconMessage2,
  IconShoppingCart,
  IconUserPlus,
} from "@tabler/icons-react";
import type { ChannelStatus } from "@prisma/client";
import type { IconType } from "@/lib/content/types";
import { DASH, type DashPath } from "./routes";
import type { Tone } from "./tone";
import type { Text } from "@/lib/i18n/messages";

export type KpiKey = "conversations" | "leads" | "orders" | "revenue";

/** Each card opens the page its number comes from; revenue lives in the analytics. */
export const KPI_META: { key: KpiKey; label: Text; icon: IconType; href: DashPath; money?: boolean }[] = [
  { key: "conversations", label: "dashboard.home.todaySConversations", icon: IconMessage2, href: DASH.conversations },
  { key: "leads", label: "dashboard.home.newLeads", icon: IconUserPlus, href: DASH.leads },
  { key: "orders", label: "dashboard.home.newOrders", icon: IconShoppingCart, href: DASH.orders },
  { key: "revenue", label: "dashboard.home.revenue", icon: IconCash, href: DASH.analytics, money: true },
];

export const LIMIT_LABELS = {
  heading: "dashboard.home.remainingMessageLimit",
  left: "dashboard.home.left",
  used: "dashboard.home.used",
  noPlan: "dashboard.home.noActivePlan",
  unlimited: "dashboard.home.unlimited",
  renews: "dashboard.home.renews",
} as const;

export const CHANNEL_STATE: Record<ChannelStatus, { tone: Tone; label: Text }> = {
  ACTIVE: { tone: "green", label: "dashboard.home.active" },
  DELAYED: { tone: "amber", label: "dashboard.home.issue" },
  OFF: { tone: "red", label: "dashboard.home.offline" },
};
