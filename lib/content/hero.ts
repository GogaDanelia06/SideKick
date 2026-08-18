import { IconFlask, IconSparkles } from "@tabler/icons-react";
import type { Bilingual, IconType } from "./types";

export type HeroMock = "chat" | "dashboard" | "tester";

export type HeroSlide = {
  id: string;
  mock: HeroMock;
  badge?: { icon: IconType; text: Bilingual };
  title: { pre: Bilingual; em: Bilingual; post?: Bilingual };
  sub: Bilingual;
};

/**
 * How long a slide holds before the next one starts.
 *
 * Five seconds was the first guess and it was wrong: each slide carries a
 * headline, a paragraph and a mock conversation, and a reader who starts on the
 * paragraph is interrupted by the next slide before the end of it. A carousel
 * nobody can finish reading is a carousel nobody reads.
 */
export const HERO_INTERVAL_MS = 10_000;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "sales",
    mock: "chat",
    badge: { icon: IconSparkles, text: { ka: "AI ასისტენტი ბიზნესისთვის", en: "AI assistant for business" } },
    title: {
      pre: { ka: "გაყიდვები", en: "Sales" },
      em: { ka: "ავტომატურად", en: "on autopilot" },
      post: { ka: "— AI ბოტით", en: "— with an AI bot" },
    },
    sub: {
      ka: "Sidekick პასუხობს კლიენტებს 24/7 Facebook-ზე, Instagram-ზე და WhatsApp-ზე, ღებულობს შეკვეთებს და ზრდის გაყიდვებს — ყოველგვარი კოდის გარეშე.",
      en: "Sidekick answers customers 24/7 on Facebook, Instagram and WhatsApp, takes orders and grows sales — with no code at all.",
    },
  },
  {
    id: "panel",
    mock: "dashboard",
    title: {
      pre: { ka: "მართე ყველაფერი", en: "Manage everything" },
      em: { ka: "ერთი პანელიდან", en: "from one panel" },
    },
    sub: {
      ka: "გაყიდვები, ჩათები, ლიდები და საწყობი — ყველა მონაცემი ერთ ეკრანზე. მიიღე გადაწყვეტილებები რეალურ დროში, ზედმეტი ხელსაწყოების გარეშე.",
      en: "Sales, chats, leads and inventory — every metric on one screen. Make decisions in real time, without extra tools.",
    },
  },
  {
    id: "test",
    mock: "tester",
    badge: { icon: IconFlask, text: { ka: "გამართე ბოტი გაშვებამდე", en: "Tune your bot before launch" } },
    title: {
      pre: { ka: "დატესტე AI", en: "Test the AI" },
      em: { ka: "შენს პროდუქტებზე", en: "on your own products" },
    },
    sub: {
      ka: "დაუსვი ბოტს კითხვები შენივე ასორტიმენტიდან და ნახე პასუხები ცოცხლად — გაშვებამდე. დარწმუნდი, რომ AI ზუსტად საუბრობს შენი ბიზნესის ენაზე.",
      en: "Ask the bot questions from your own catalog and see the answers live — before launch. Make sure the AI speaks your business's language exactly.",
    },
  },
];
