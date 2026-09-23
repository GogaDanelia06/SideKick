import {
  IconBuildingStore,
  IconLayoutDashboard,
  IconChartHistogram,
  IconHelpCircle,
  IconPalette,
  type Icon,
} from "@tabler/icons-react";
import type { Text } from "@/lib/i18n/messages";

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

export type AdminNavItem = { href: AdminPath; label: Text; icon: Icon };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN.home, label: "admin.routes.overview", icon: IconLayoutDashboard },
  { href: ADMIN.businesses, label: "admin.routes.businessesPlans", icon: IconBuildingStore },
  { href: ADMIN.analytics, label: "admin.routes.analytics", icon: IconChartHistogram },
  { href: ADMIN.tutorials, label: "admin.routes.helpContent", icon: IconHelpCircle },
  { href: ADMIN.appearance, label: "admin.routes.appearance", icon: IconPalette },
];
