import {
  IconGift,
  IconHeading,
  IconLayoutGrid,
  IconSearch,
  IconTag,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const PRICING_PAGE: AdminPage = {
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
};
