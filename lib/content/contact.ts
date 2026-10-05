import type { Bilingual } from "./types";

export const CONTACT_HEADING = {
  badge: { ka: "კონტაქტი", en: "Contact" },
  title: { ka: "დაგვიკავშირდი", en: "Get in touch" },
  sub: {
    ka: "დაუსვი კითხვა პირდაპირ ჩვენს AI აგენტს — პასუხს აქვე, რეალურ დროში მიიღებ",
    en: "Ask our AI agent directly — you'll get an answer right here, in real time.",
  },
};

/** The contact cards' labels; the email and phone themselves are set in the admin panel. */
export const CONTACT_LABELS = {
  email: { ka: "ელფოსტა", en: "Email" },
  phone: { ka: "ტელეფონი", en: "Phone" },
} satisfies Record<string, Bilingual>;

export const CONTACT_SEED: Bilingual = {
  ka: "გამარჯობა! 👋 მე Sidekick-ის AI აგენტი ვარ. დამისვით ნებისმიერი კითხვა — ფასებზე, ინტეგრაციაზე ან დემოზე — და მყისვე გიპასუხებთ.",
  en: "Hi! 👋 I'm Sidekick's AI agent. Ask me anything — about pricing, integration or a demo — and I'll answer right away.",
};

export const CONTACT_PREVIEW: { role: "user" | "ai"; text: Bilingual }[] = [
  { role: "user", text: { ka: "ფასები რა არის?", en: "What are the prices?" } },
  {
    role: "ai",
    text: {
      ka: "Standard პაკეტი ღირს 99₾/თვე და პირველი თვე სრულიად უფასოა (ბარათი არ სჭირდება). გნებავთ დაგეხმაროთ რეგისტრაციაში?",
      en: "The Standard plan is ₾99/month and the first month is completely free (no card required). Would you like help signing up?",
    },
  },
];
