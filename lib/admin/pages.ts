import {
  IconAddressBook,
  IconCarouselHorizontal,
  IconChartBar,
  IconFileText,
  IconGift,
  IconHeading,
  IconHelpCircle,
  IconHome,
  IconInfoCircle,
  IconLayoutGrid,
  IconLock,
  IconMail,
  IconPhoto,
  IconScale,
  IconSearch,
  IconSparkles,
  IconTag,
  IconUserPlus,
  type Icon,
} from "@tabler/icons-react";
import type { Bilingual } from "@/lib/content/types";

/**
 * The admin panel is organised the way the site is: you pick a **page** in the
 * left column, then a **section of that page** in the second column.
 *
 * That mirrors how the owner thinks about the site ("the story block on the
 * landing page") rather than how it is stored, and it is why this registry maps
 * pages → sections rather than exposing one flat list of editors.
 *
 * Each section names the editor that renders it; the data each one needs is
 * loaded by app/admin/page/[slug]/page.tsx.
 */

export type SectionKind =
  | "carousel"
  | "stats"
  | "text"
  | "boxes"
  | "plans"
  | "faq"
  | "legal"
  | "seo";

export type AdminSection = {
  key: string;
  label: Bilingual;
  icon: Icon;
  kind: SectionKind;
  /** kind: "text" — which group in lib/site/textKeys.ts */
  textGroup?: string;
  /** kind: "boxes" — which table */
  boxKind?: "benefit" | "service";
  /** kind: "legal" — which document */
  legalDoc?: string;
  /** kind: "seo" — which public path, when it isn't the page's own route.
   *  The legal screen drives three separate pages, so it needs this. */
  seoPath?: string;
};

export type AdminPage = {
  slug: string;
  label: Bilingual;
  icon: Icon;
  /** The public page this drives — shown to the admin for orientation. */
  route: string;
  sections: AdminSection[];
};

const ka = (ka: string, en: string): Bilingual => ({ ka, en });

export const ADMIN_PAGES: AdminPage[] = [
  {
    slug: "landing",
    label: ka("მთავარი გვერდი", "Landing page"),
    icon: IconHome,
    route: "/",
    sections: [
      {
        key: "carousel",
        label: ka("მთავარი კარუსელი", "Hero carousel"),
        icon: IconCarouselHorizontal,
        kind: "carousel",
      },
      { key: "stats", label: ka("სტატისტიკა", "Stats strip"), icon: IconChartBar, kind: "stats" },
      {
        key: "story",
        label: ka("ისტორიის სექცია", "Story section"),
        icon: IconFileText,
        kind: "text",
        textGroup: "story",
      },
      {
        key: "benefits",
        label: ka("უპირატესობების სექცია", "Benefits section"),
        icon: IconLayoutGrid,
        kind: "boxes",
        boxKind: "benefit",
      },
      {
        key: "cta",
        label: ka("„დარწმუნდი სანამ გადაიხდი“", "“See results before you pay”"),
        icon: IconSparkles,
        kind: "text",
        textGroup: "cta",
      },
      {
        key: "seo",
        label: ka("SEO", "SEO"),
        icon: IconSearch,
        kind: "seo",
      },
    ],
  },
  {
    slug: "pricing",
    label: ka("ფასების გვერდი", "Pricing page"),
    icon: IconTag,
    route: "/pricing",
    sections: [
      {
        key: "heading",
        label: ka("სექციის სათაური (H1)", "Section heading (H1)"),
        icon: IconHeading,
        kind: "text",
        textGroup: "pricing-heading",
      },
      {
        key: "services",
        label: ka("სერვისების სექცია", "Services section"),
        icon: IconLayoutGrid,
        kind: "boxes",
        boxKind: "service",
      },
      { key: "plans", label: ka("პაკეტები და ფასები", "Plans & prices"), icon: IconTag, kind: "plans" },
      {
        key: "free",
        label: ka("უფასო პერიოდის სექცია", "Free-period section"),
        icon: IconGift,
        kind: "text",
        textGroup: "free-period",
      },
      {
        key: "seo",
        label: ka("SEO", "SEO"),
        icon: IconSearch,
        kind: "seo",
      },
    ],
  },
  {
    slug: "about",
    label: ka("ჩვენ შესახებ", "About page"),
    icon: IconInfoCircle,
    route: "/about",
    sections: [
      {
        key: "about",
        label: ka("სათაური, ტექსტი, ფოტო", "Title, text, photo"),
        icon: IconPhoto,
        kind: "text",
        textGroup: "about",
      },
      {
        key: "seo",
        label: ka("SEO", "SEO"),
        icon: IconSearch,
        kind: "seo",
      },
    ],
  },
  {
    slug: "contact",
    label: ka("კონტაქტის გვერდი", "Contact page"),
    icon: IconMail,
    route: "/contact",
    sections: [
      {
        key: "details",
        label: ka("საკონტაქტო ინფორმაცია", "Contact details"),
        icon: IconAddressBook,
        kind: "text",
        textGroup: "contact",
      },
      { key: "faq", label: ka("ხშირად დასმული კითხვები", "FAQ"), icon: IconHelpCircle, kind: "faq" },
      {
        key: "seo",
        label: ka("SEO", "SEO"),
        icon: IconSearch,
        kind: "seo",
      },
    ],
  },
  {
    slug: "registration",
    label: ka("რეგისტრაციის გვერდი", "Registration page"),
    icon: IconUserPlus,
    route: "/register",
    sections: [
      {
        key: "free",
        label: ka("უფასო პერიოდის ტექსტი", "Free-period text"),
        icon: IconGift,
        kind: "text",
        textGroup: "free-period",
      },
      // No SEO section: /register sits under the auth layout, which sends
      // noindex on purpose. Offering SEO fields here would only mislead.
    ],
  },
  {
    slug: "legal",
    label: ka("იურიდიული გვერდები", "Legal pages"),
    icon: IconScale,
    route: "/terms",
    sections: [
      {
        key: "terms",
        label: ka("წესები და პირობები", "Terms & conditions"),
        icon: IconScale,
        kind: "legal",
        legalDoc: "terms",
      },
      {
        key: "privacy",
        label: ka("კონფიდენციალურობა", "Privacy policy"),
        icon: IconLock,
        kind: "legal",
        legalDoc: "privacy",
      },
      {
        key: "data-protection",
        label: ka("პერსონალურ მონაცემთა დაცვა", "Data protection"),
        icon: IconLock,
        kind: "legal",
        legalDoc: "data-protection",
      },
      // One screen drives three public pages, so each needs its own SEO row.
      {
        key: "seo-terms",
        label: ka("SEO — წესები", "SEO — Terms"),
        icon: IconSearch,
        kind: "seo",
        seoPath: "/terms",
      },
      {
        key: "seo-privacy",
        label: ka("SEO — კონფიდენციალურობა", "SEO — Privacy"),
        icon: IconSearch,
        kind: "seo",
        seoPath: "/privacy",
      },
      {
        key: "seo-data",
        label: ka("SEO — მონაცემთა დაცვა", "SEO — Data protection"),
        icon: IconSearch,
        kind: "seo",
        seoPath: "/data-protection",
      },
    ],
  },
];

export function findAdminPage(slug: string): AdminPage | undefined {
  return ADMIN_PAGES.find((p) => p.slug === slug);
}
