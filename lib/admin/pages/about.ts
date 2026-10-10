import {
  IconInfoCircle,
  IconPhoto,
  IconSearch,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const ABOUT_PAGE: AdminPage = {
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
};
