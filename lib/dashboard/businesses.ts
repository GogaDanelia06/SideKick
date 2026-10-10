import type { Role } from "@prisma/client";
import { phrase, type Text } from "@/lib/i18n/messages";

export const MAX_OWNED_BUSINESSES = 5;

export const BUSINESS_NAME_MAX = 120;

export const cleanBusinessName = (name: string) => name.trim().replace(/\s+/g, " ");

export const sameBusinessName = (a: string, b: string) =>
  cleanBusinessName(a).toLocaleLowerCase() === cleanBusinessName(b).toLocaleLowerCase();

export const OWNED_LIMIT_TEXT: Text = phrase("dashboard.businesses.ownedLimit", { max: MAX_OWNED_BUSINESSES });

export const ROLE_LABEL: Record<Role, Text> = {
  OWNER: "dashboard.businesses.owner",
  ADMIN: "dashboard.businesses.admin",
  OPERATOR: "dashboard.businesses.operator",
  VIEWER: "dashboard.businesses.viewer",
};
