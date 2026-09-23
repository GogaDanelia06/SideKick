import type { Role } from "@prisma/client";
import { phrase, type Text } from "@/lib/i18n/messages";

/** Each new business starts a free trial, so how many one person may own is capped. */
export const MAX_OWNED_BUSINESSES = 5;

/** The same limit registration puts on the company name. */
export const BUSINESS_NAME_MAX = 120;

/** A business name as stored: trimmed, with single spaces. */
export const cleanBusinessName = (name: string) => name.trim().replace(/\s+/g, " ");

/** Names that differ only in case or spacing count as the same, so the switcher never shows two alike. */
export const sameBusinessName = (a: string, b: string) =>
  cleanBusinessName(a).toLocaleLowerCase() === cleanBusinessName(b).toLocaleLowerCase();

export const OWNED_LIMIT_TEXT: Text = phrase("dashboard.businesses.ownedLimit", { max: MAX_OWNED_BUSINESSES });

export const ROLE_LABEL: Record<Role, Text> = {
  OWNER: "dashboard.businesses.owner",
  ADMIN: "dashboard.businesses.admin",
  OPERATOR: "dashboard.businesses.operator",
  VIEWER: "dashboard.businesses.viewer",
};
