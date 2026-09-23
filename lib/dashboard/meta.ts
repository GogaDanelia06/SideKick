import { DASH } from "./routes";
import type { Text } from "@/lib/i18n/messages";

export type DashMeta = { title: Text; subtitle: Text };

export const DASH_META: Record<string, DashMeta> = {
  [DASH.home]: { title: "dashboard.meta.dashboard", subtitle: "dashboard.meta.overview" },
  [DASH.conversations]: { title: "dashboard.meta.conversations", subtitle: "dashboard.meta.everyChatInOne" },
  [DASH.ai]: { title: "dashboard.meta.aiAssistant", subtitle: "dashboard.meta.botConfiguration" },
  [DASH.channels]: { title: "dashboard.meta.channels", subtitle: "dashboard.meta.integrations" },
  [DASH.products]: { title: "dashboard.meta.productsInventory", subtitle: "dashboard.meta.stockManagement" },
  [DASH.orders]: { title: "dashboard.meta.orders", subtitle: "dashboard.meta.orderManagement" },
  [DASH.leads]: { title: "dashboard.meta.leads", subtitle: "dashboard.meta.potentialCustomers" },
  [DASH.analytics]: { title: "dashboard.meta.analytics", subtitle: "dashboard.meta.detailedStatistics" },
  [DASH.team]: { title: "dashboard.meta.team", subtitle: "dashboard.meta.membersAndRoles" },
  [DASH.billing]: { title: "dashboard.meta.billing", subtitle: "dashboard.meta.subscriptionAndPayments" },
  [DASH.videos]: { title: "dashboard.meta.tutorials", subtitle: "dashboard.meta.guides" },
  [DASH.profile]: { title: "dashboard.meta.profile", subtitle: "dashboard.meta.personalInformation" },
};
