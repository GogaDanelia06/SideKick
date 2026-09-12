import type { Bilingual } from "./types";

export const CHAT = {
  aiLabel: "✦ Sidekick AI",
  online: { ka: "ონლაინ", en: "online" },
  onlineDetailed: { ka: "ონლაინ · პასუხობს წამებში", en: "online · replies in seconds" },
  send: { ka: "გაგზავნა", en: "Send" },
  ariaChat: { ka: "AI ჩათი", en: "AI chat" },
  ariaClose: { ka: "დახურვა", en: "Close" },
  widgetPlaceholder: { ka: "დაწერე შეტყობინება...", en: "Type a message..." },
  /** Read out by screen readers while the dots animate; never shown as text. */
  typing: { ka: "Sidekick AI წერს…", en: "Sidekick AI is typing…" },
  attach: { ka: "ფოტოს ან ვიდეოს მიმაგრება", en: "Attach a photo or video" },
  badType: {
    ka: "მხოლოდ ფოტო (JPG, PNG, WebP, GIF) ან ვიდეო (MP4, WebM).",
    en: "Photos (JPG, PNG, WebP, GIF) or video (MP4, WebM) only.",
  },
  tooLarge: {
    ka: "ფაილი 8MB-ზე დიდია.",
    en: "That file is larger than 8MB.",
  },
  contactPlaceholder: { ka: "დაწერე შენი კითხვა...", en: "Type your question..." },
  widgetGreeting: {
    ka: "გამარჯობა! 👋 რით შემიძლია დაგეხმაროთ?",
    en: "Hi! 👋 How can I help you?",
  },
} satisfies Record<string, Bilingual | string>;

/** Suggested questions under the chat thread. */
export const CHAT_CHIPS: Bilingual[] = [
  { ka: "ფასები რა არის?", en: "What are the prices?" },
  { ka: "როგორ ხდება ინტეგრაცია?", en: "How does integration work?" },
  { ka: "დემო მინდა", en: "I want a demo" },
];
