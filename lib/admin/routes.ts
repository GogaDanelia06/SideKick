import {
  IconLayoutDashboard,
  IconChartBar,
  IconTag,
  IconHelpCircle,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";
import type { Bilingual } from "@/lib/content/types";

export const ADMIN = {
  home: "/admin",
  stats: "/admin/stats",
  plans: "/admin/plans",
  faq: "/admin/faq",
  seo: "/admin/seo",
} as const;

export type AdminPath = (typeof ADMIN)[keyof typeof ADMIN];

export type AdminNavItem = { href: AdminPath; label: Bilingual; icon: Icon };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN.home, label: { ka: "მთავარი", en: "Overview" }, icon: IconLayoutDashboard },
  { href: ADMIN.stats, label: { ka: "სტატისტიკა", en: "Stats" }, icon: IconChartBar },
  { href: ADMIN.plans, label: { ka: "პაკეტები", en: "Plans" }, icon: IconTag },
  { href: ADMIN.faq, label: { ka: "FAQ", en: "FAQ" }, icon: IconHelpCircle },
  { href: ADMIN.seo, label: { ka: "SEO", en: "SEO" }, icon: IconSearch },
];
