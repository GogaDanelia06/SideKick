import {
  IconLock,
  IconScale,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const LEGAL_PAGE: AdminPage = {
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
    {
      key: "data-deletion",
      label: ka("მონაცემების წაშლა", "Data deletion"),
      icon: IconTrash,
      kind: "legal",
      legalDoc: "data-deletion",
    },
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
    {
      key: "seo-deletion",
      label: ka("SEO — მონაცემების წაშლა", "SEO — Data deletion"),
      icon: IconSearch,
      kind: "seo",
      seoPath: "/data-deletion",
    },
  ],
};
