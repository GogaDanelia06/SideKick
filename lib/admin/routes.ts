import {
  IconLayoutDashboard,
  IconChartBar,
  IconChartHistogram,
  IconTag,
  IconHelpCircle,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";
import type { Bilingual } from "@/lib/content/types";
import { LEGAL_DOCS, TEXT_GROUPS } from "@/lib/site/textKeys";

export const ADMIN = {
  home: "/admin",
  analytics: "/admin/analytics",
  stats: "/admin/stats",
  plans: "/admin/plans",
  faq: "/admin/faq",
  seo: "/admin/seo",
} as const;

export type AdminPath = (typeof ADMIN)[keyof typeof ADMIN];

export type AdminNavItem = { href: AdminPath; label: Bilingual; icon: Icon };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN.home, label: { ka: "მთავარი", en: "Overview" }, icon: IconLayoutDashboard },
  { href: ADMIN.analytics, label: { ka: "ანალიტიკა", en: "Analytics" }, icon: IconChartHistogram },
  { href: ADMIN.stats, label: { ka: "სტატისტიკა", en: "Stats" }, icon: IconChartBar },
  { href: ADMIN.plans, label: { ka: "პაკეტები", en: "Plans" }, icon: IconTag },
  { href: ADMIN.faq, label: { ka: "FAQ", en: "FAQ" }, icon: IconHelpCircle },
  { href: ADMIN.seo, label: { ka: "SEO", en: "SEO" }, icon: IconSearch },
];

/** Editable text sections, generated from the field registry so the nav can
 *  never drift from the screens that actually exist. */
export const ADMIN_CONTENT_NAV = TEXT_GROUPS.map((g) => ({
  href: `/admin/content/${g.slug}`,
  label: g.title,
  page: g.page,
}));

/** Icon+text box lists (landing benefits, pricing services). */
export const ADMIN_BOX_NAV = [
  {
    href: "/admin/hero",
    label: { ka: "მთავარი კარუსელი", en: "Homepage carousel" } satisfies Bilingual,
    page: { ka: "მთავარი გვერდი", en: "Landing page" } satisfies Bilingual,
  },
  {
    href: "/admin/boxes/benefit",
    label: { ka: "სერვისის უპირატესობები", en: "Service benefits" } satisfies Bilingual,
    page: { ka: "მთავარი გვერდი", en: "Landing page" } satisfies Bilingual,
  },
  {
    href: "/admin/boxes/service",
    label: { ka: "სერვისების სექცია", en: "Services section" } satisfies Bilingual,
    page: { ka: "ფასების გვერდი", en: "Pricing page" } satisfies Bilingual,
  },
];

/** Legal documents — edited as ordered sections, one screen per document. */
export const ADMIN_LEGAL_NAV = LEGAL_DOCS.map((d) => ({
  href: `/admin/legal/${d.doc}`,
  label: d.title,
  page: { ka: `${d.route} გვერდი`, en: `${d.route} page` } satisfies Bilingual,
}));
