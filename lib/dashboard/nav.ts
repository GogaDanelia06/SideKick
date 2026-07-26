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
import type { Bilingual, IconType } from "@/lib/content/types";
import { DASH } from "./routes";

export type DashNavItem = {
  href: string;
  icon: IconType;
  label: Bilingual;
  badge?: string;
};

export const DASH_NAV: DashNavItem[] = [
  { href: DASH.home, icon: IconLayoutDashboard, label: { ka: "მთავარი", en: "Overview" } },
  { href: DASH.conversations, icon: IconMessages, label: { ka: "მიმოწერები", en: "Conversations" }, badge: "3" },
  { href: DASH.ai, icon: IconRobot, label: { ka: "AI ასისტენტი", en: "AI assistant" } },
  { href: DASH.channels, icon: IconPlugConnected, label: { ka: "არხები", en: "Channels" } },
  { href: DASH.products, icon: IconPackage, label: { ka: "პროდუქტები", en: "Products" } },
  { href: DASH.orders, icon: IconShoppingCart, label: { ka: "შეკვეთები", en: "Orders" }, badge: "5" },
  { href: DASH.leads, icon: IconUserPlus, label: { ka: "ლიდები", en: "Leads" } },
  { href: DASH.analytics, icon: IconChartBar, label: { ka: "ანალიტიკა", en: "Analytics" } },
  { href: DASH.team, icon: IconUsers, label: { ka: "გუნდი", en: "Team" } },
  { href: DASH.billing, icon: IconCreditCard, label: { ka: "ბილინგი", en: "Billing" } },
  { href: DASH.videos, icon: IconBrandYoutube, label: { ka: "ვიდეო ინსტრუქციები", en: "Tutorials" } },
];

export const DASH_TABS = [DASH.home, DASH.conversations, DASH.orders, DASH.products, DASH.analytics];
