import {
  IconGift,
  IconUserPlus,
} from "@tabler/icons-react";
import { ka, type AdminPage } from "./types";

export const REGISTRATION_PAGE: AdminPage = {
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
  ],
};
