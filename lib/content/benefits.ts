import {
  IconClockBolt,
  IconClockHour4,
  IconMessage2,
  IconPlugConnected,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "./types";

export type Benefit = { icon: IconType; title: Bilingual; desc: Bilingual };

/** "What Sidekick does" — the six-card benefits grid on the home page. */
export const BENEFITS: Benefit[] = [
  {
    icon: IconPlugConnected,
    title: { ka: "უკავშირდება Facebook / Instagram / WhatsApp-ს", en: "Connects to Facebook / Instagram / WhatsApp" },
    desc: { ka: "სამივე არხი ერთ სივრცეში, რამდენიმე წუთში.", en: "All three channels in one place, in minutes." },
  },
  {
    icon: IconClockHour4,
    title: { ka: "პასუხობს 24/7", en: "Answers 24/7" },
    desc: { ka: "კლიენტი იღებს პასუხს წამებში, სამუშაო საათების მიღმაც.", en: "Customers get a reply in seconds, even outside working hours." },
  },
  {
    icon: IconClockBolt,
    title: { ka: "ზოგავს დროს", en: "Saves time" },
    desc: { ka: "ავტომატურად პასუხობს განმეორებად კითხვებს — გუნდი თავისუფლდება.", en: "Automatically answers repetitive questions — freeing up your team." },
  },
  {
    icon: IconUserPlus,
    title: { ka: "აგროვებს ლიდებს", en: "Collects leads" },
    desc: { ka: "ამოიცნობს დაინტერესებულ კლიენტს და ქმნის ჩანაწერს CRM-ში.", en: "Spots interested customers and creates a record in your CRM." },
  },
  {
    icon: IconTrendingUp,
    title: { ka: "ზრდის გაყიდვებს", en: "Grows sales" },
    desc: { ka: "სთავაზობს პროდუქტებს, აფორმებს შეკვეთებს, ამცირებს დაკარგულ გაყიდვებს.", en: "Recommends products, places orders, and reduces lost sales." },
  },
  {
    icon: IconMessage2,
    title: { ka: "პასუხობს კომენტარებს", en: "Replies to comments" },
    desc: { ka: "რეაგირებს პოსტების კომენტარებზე და გადაჰყავს მიმოწერაში.", en: "Responds to comments on posts and moves them into direct messages." },
  },
];
