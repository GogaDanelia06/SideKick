import type { Bilingual } from "./types";

export const CHAT = {
  aiLabel: "✦ Sidekick AI",
  online: { ka: "ონლაინ", en: "online" },
  onlineDetailed: { ka: "ონლაინ · პასუხობს წამებში", en: "online · replies in seconds" },
  send: { ka: "გაგზავნა", en: "Send" },
  ariaChat: { ka: "AI ჩათი", en: "AI chat" },
  ariaClose: { ka: "დახურვა", en: "Close" },
  widgetPlaceholder: { ka: "დაწერე შეტყობინება...", en: "Type a message..." },
  contactPlaceholder: { ka: "დაწერე შენი კითხვა...", en: "Type your question..." },
  widgetGreeting: {
    ka: "გამარჯობა! 👋 რით შემიძლია დაგეხმაროთ?",
    en: "Hi! 👋 How can I help you?",
  },
} satisfies Record<string, Bilingual | string>;
