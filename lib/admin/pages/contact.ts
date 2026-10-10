import {
  IconAddressBook,
  IconHeading,
  IconHelpCircle,
  IconMail,
  IconSearch,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const CONTACT_PAGE: AdminPage = {
  slug: "contact",
  label: ka("კონტაქტის გვერდი", "Contact page"),
  icon: IconMail,
  route: "/contact",
  sections: [
    {
      key: "heading",
      label: ka("სექციის სათაური (H1)", "Section heading (H1)"),
      icon: IconHeading,
      kind: "text",
      textGroup: "contact-heading",
    },
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
};
