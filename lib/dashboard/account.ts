import type { Bilingual } from "@/lib/content/types";

/** The signed-in user (mock — a real session replaces this later). */
export const ACCOUNT: {
  name: string;
  email: string;
  initial: string;
  plan: Bilingual;
} = {
  name: "Mariam K.",
  email: "mariam@sidekick.ge",
  initial: "მ",
  plan: { ka: "Standard პაკეტი", en: "Standard plan" },
};
