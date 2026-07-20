import { IconMail, IconPhone } from "@tabler/icons-react";
import type { Bilingual, IconType } from "./types";

export const CONTACT_HEADING = {
  badge: { ka: "კონტაქტი", en: "Contact" },
  title: { ka: "დაგვიკავშირდი", en: "Get in touch" },
  sub: {
    ka: "დაუსვი კითხვა პირდაპირ ჩვენს AI აგენტს — პასუხს აქვე, რეალურ დროში მიიღებ",
    en: "Ask our AI agent directly — you'll get an answer right here, in real time.",
  },
};

export type ContactInfoItem = {
  icon: IconType;
  label: Bilingual;
  value: string;
  href: string;
};

export const CONTACT_INFO: ContactInfoItem[] = [
  { icon: IconMail, label: { ka: "ელფოსტა", en: "Email" }, value: "hello@sidekick.ai", href: "mailto:hello@sidekick.ai" },
  { icon: IconPhone, label: { ka: "ტელეფონი", en: "Phone" }, value: "+995 32 2 000 000", href: "tel:+99532200000" },
];

/** Quick-reply chips above the input. */
export const CONTACT_CHIPS: Bilingual[] = [
  { ka: "ფასები რა არის?", en: "What are the prices?" },
  { ka: "როგორ ხდება ინტეგრაცია?", en: "How does integration work?" },
  { ka: "დემო მინდა", en: "I want a demo" },
];

/** First AI message shown when the contact thread opens. */
export const CONTACT_SEED: Bilingual = {
  ka: "გამარჯობა! 👋 მე Sidekick-ის AI აგენტი ვარ. დამისვით ნებისმიერი კითხვა — ფასებზე, ინტეგრაციაზე ან დემოზე — და მყისვე გიპასუხებთ.",
  en: "Hi! 👋 I'm Sidekick's AI agent. Ask me anything — about pricing, integration or a demo — and I'll answer right away.",
};
