import type { Text } from "@/lib/i18n/messages";

type Rule = { keywords: string[]; reply: Text };

const RULES: Rule[] = [
  {
    keywords: ["ფას", "ღირ", "price", "თანხ"],
    reply: "chat.bot.theStandardPlanIs",
  },
  {
    keywords: ["ინტეგრ", "facebook", "instagram", "whatsapp", "არხ"],
    reply: "chat.bot.iConnectToFacebook",
  },
  {
    keywords: ["დემ", "demo", "ცად", "ტესტ"],
    reply: "chat.bot.happyToHelpFor",
  },
  {
    keywords: ["გამარ", "სალ", "hello", "hi"],
    reply: "chat.bot.helloHowCanI",
  },
];

const FALLBACK: Text = "chat.bot.thanksForYourQuestion";

export function getBotReply(input: string): Text {
  const q = input.toLowerCase();
  return RULES.find((rule) => rule.keywords.some((k) => q.includes(k)))?.reply ?? FALLBACK;
}

/** Reply to an attachment; the keyword bot cannot see images, so it never claims to. */
export const ATTACHMENT_REPLY: Text = "chat.bot.thanksIVeGot";
