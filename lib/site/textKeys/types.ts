import type { Text } from "@/lib/i18n/messages";

export type TextField = {
  key: string;
  label: Text;
  kind: "short" | "long" | "url" | "email" | "tel" | "media";
  singleLang?: boolean;
  hint?: Text;
};

export type TextGroup = {
  slug: string;
  title: Text;
  page: Text;
  description?: Text;
  fields: TextField[];
};

export const ka = (ka: string, en: string): Text => ({ ka, en });
