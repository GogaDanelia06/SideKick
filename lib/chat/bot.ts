import type { Bilingual } from "@/lib/i18n/types";

type Rule = { keywords: string[]; reply: Bilingual };

const RULES: Rule[] = [
  {
    keywords: ["ფას", "ღირ", "price", "თანხ"],
    reply: {
      ka: "Standard პაკეტი ღირს 99₾/თვე და პირველი თვე სრულიად უფასოა (ბარათი არ სჭირდება). გნებავთ დაგეხმაროთ რეგისტრაციაში?",
      en: "The Standard plan is ₾99/month and the first month is completely free (no card required). Would you like help signing up?",
    },
  },
  {
    keywords: ["ინტეგრ", "facebook", "instagram", "whatsapp", "არხ"],
    reply: {
      ka: "ვუკავშირდები Facebook-ს, Instagram-სა და WhatsApp-ს რამდენიმე წუთში — კოდის გარეშე. თითოეულ არხს აქვს ვიდეო-ინსტრუქცია. რომელი გაინტერესებთ?",
      en: "I connect to Facebook, Instagram and WhatsApp in minutes — no code. Each channel has a video guide. Which one are you interested in?",
    },
  },
  {
    keywords: ["დემ", "demo", "ცად", "ტესტ"],
    reply: {
      ka: "სიამოვნებით! უფასო დემოსთვის დაგჭირდებათ მხოლოდ რეგისტრაცია — შემდეგ პირდაპირ თქვენს პროდუქტებზე დაატესტებთ ბოტს. გავხსნა რეგისტრაციის გვერდი?",
      en: "Happy to help! For a free demo you only need to sign up — then you can test the bot right on your own products. Shall I open the sign-up page?",
    },
  },
  {
    keywords: ["გამარ", "სალ", "hello", "hi"],
    reply: {
      ka: "გამარჯობა! 😊 რით შემიძლია დაგეხმაროთ დღეს?",
      en: "Hello! 😊 How can I help you today?",
    },
  },
];

const FALLBACK: Bilingual = {
  ka: "დიდი მადლობა კითხვისთვის! Sidekick პასუხობს კლიენტებს 24/7, აგროვებს ლიდებს და აფორმებს შეკვეთებს ავტომატურად. დამისვით უფრო კონკრეტული კითხვა და დეტალურად აგიხსნით.",
  en: "Thanks for your question! Sidekick answers customers 24/7, collects leads and places orders automatically. Ask me something more specific and I'll explain in detail.",
};

export function getBotReply(input: string): Bilingual {
  const q = input.toLowerCase();
  return RULES.find((rule) => rule.keywords.some((k) => q.includes(k)))?.reply ?? FALLBACK;
}
