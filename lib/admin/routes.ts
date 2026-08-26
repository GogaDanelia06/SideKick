import {
  IconBuildingStore,
  IconLayoutDashboard,
  IconChartHistogram,
  IconHelpCircle,
  IconPalette,
  type Icon,
} from "@tabler/icons-react";
import type { Bilingual } from "@/lib/content/types";

/** Platform-level admin routes. Page-specific editing lives under
 *  /admin/page/[slug] and is driven by ADMIN_PAGES in lib/admin/pages.ts. */
export const ADMIN = {
  home: "/admin",
  businesses: "/admin/businesses",
  analytics: "/admin/analytics",
  tutorials: "/admin/tutorials",
  appearance: "/admin/appearance",
} as const;

export type AdminPath = (typeof ADMIN)[keyof typeof ADMIN];

export type AdminNavItem = { href: AdminPath; label: Bilingual; icon: Icon };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN.home, label: { ka: "მთავარი", en: "Overview" }, icon: IconLayoutDashboard },
  { href: ADMIN.businesses, label: { ka: "ბიზნესები და გეგმები", en: "Businesses & plans" }, icon: IconBuildingStore },
  { href: ADMIN.analytics, label: { ka: "ანალიტიკა", en: "Analytics" }, icon: IconChartHistogram },
  { href: ADMIN.tutorials, label: { ka: "ინსტრუქციები", en: "Help content" }, icon: IconHelpCircle },
  { href: ADMIN.appearance, label: { ka: "იერსახე", en: "Appearance" }, icon: IconPalette },
];
