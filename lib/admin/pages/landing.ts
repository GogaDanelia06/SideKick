import {
  IconCarouselHorizontal,
  IconChartBar,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const LANDING_PAGE: AdminPage = {
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
    {
      key: "stats",
      label: ka("ციფრების ზოლი", "Stats strip"),
      icon: IconChartBar,
      kind: "stats",
    },
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
};
