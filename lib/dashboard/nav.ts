import {
  IconLayoutDashboard,
  IconMessages,
  IconRobot,
  IconPlugConnected,
  IconPackage,
  IconShoppingCart,
  IconUserPlus,
  IconChartBar,
  IconUsers,
  IconCreditCard,
  IconBrandYoutube,
} from "@tabler/icons-react";
import type { IconType } from "@/lib/content/types";
import { DASH } from "./routes";
import type { Text } from "@/lib/i18n/messages";

export type DashNavItem = {
  href: string;
  icon: IconType;
  label: Text;
};

export const DASH_NAV: DashNavItem[] = [
  { href: DASH.home, icon: IconLayoutDashboard, label: "dashboard.nav.overview" },
  { href: DASH.conversations, icon: IconMessages, label: "dashboard.nav.conversations" },
  { href: DASH.ai, icon: IconRobot, label: "dashboard.nav.aiAssistant" },
  { href: DASH.channels, icon: IconPlugConnected, label: "dashboard.nav.channels" },
  { href: DASH.products, icon: IconPackage, label: "dashboard.nav.products" },
  { href: DASH.orders, icon: IconShoppingCart, label: "dashboard.nav.orders" },
  { href: DASH.leads, icon: IconUserPlus, label: "dashboard.nav.leads" },
  { href: DASH.analytics, icon: IconChartBar, label: "dashboard.nav.analytics" },
  { href: DASH.team, icon: IconUsers, label: "dashboard.nav.team" },
  { href: DASH.billing, icon: IconCreditCard, label: "dashboard.nav.billing" },
  { href: DASH.videos, icon: IconBrandYoutube, label: "dashboard.nav.tutorials" },
];

export const DASH_TABS = [DASH.home, DASH.conversations, DASH.orders, DASH.products, DASH.analytics];
