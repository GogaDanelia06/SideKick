import { BRAND } from "./common";
import type { Bilingual } from "./types";

export const STORY = {
  heading: { ka: "შევქმენით ის, რაც თავად გვჭირდებოდა.", en: "We built what we needed ourselves." },
  paragraphs: [
    {
      ka: "Sidekick დაიბადა რეალური ბიზნესის საჭიროებიდან. ჩვენ თვითონ ვაწყდებოდით იმავე პრობლემებს, რასაც დღეს ბევრი ბიზნესი აწყდება — დაგვიანებული პასუხები, დაკარგული ლიდები, ათობით შეტყობინება სხვადასხვა არხში და დრო, რომელიც ყოველდღიურ კომუნიკაციაში იკარგებოდა.",
      en: "Sidekick was born from a real business need. We ran into the very same problems many businesses face today — late replies, lost leads, dozens of messages across different channels, and time that drained away into everyday communication.",
    },
    {
      ka: "ამიტომ შევქმენით სისტემა, რომელმაც ჯერ ჩვენი პრობლემა მოაგვარა.",
      en: "So we built a system that first solved our own problem.",
    },
    {
      ka: "დღეს იგივე გადაწყვეტილებას სხვა ბიზნესებსაც ვუზიარებთ.",
      en: "Today we share that same solution with other businesses.",
    },
  ] satisfies Bilingual[],
};

export const BENEFITS_HEADING = {
  badge: BRAND,
  title: { ka: "რას აკეთებს Sidekick", en: "What Sidekick does" } satisfies Bilingual,
};

export const CTA_BANNER = {
  badge: { ka: "პირველი თვე უფასოდ", en: "First month free" },
  title: { ka: "დარწმუნდით შედეგში, სანამ გადაიხდით", en: "See the results before you pay" },
  text: {
    ka: "ჩვენ გვჯერა, რომ Sidekick საკუთარ ღირებულებას თავად დაგანახებთ — სწორედ ამიტომ პირველი თვე სრულიად უფასოა. მიეცით AI ასისტენტს საშუალება იმუშაოს თქვენს ბიზნესში, ფინანსური რისკის გარეშე.",
    en: "We believe Sidekick will prove its value on its own — which is exactly why the first month is completely free. Let the AI assistant work in your business, with no financial risk.",
  },
} satisfies Record<string, Bilingual>;
