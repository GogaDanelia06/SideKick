import type { Role } from "@prisma/client";
import type { Bilingual } from "@/lib/i18n/types";

/** Each new business starts a free trial, so how many one person may own is capped. */
export const MAX_OWNED_BUSINESSES = 5;

/** The same limit registration puts on the company name. */
export const BUSINESS_NAME_MAX = 120;

export const OWNED_LIMIT_TEXT: Bilingual = {
  ka: `ერთ ადამიანს მაქსიმუმ ${MAX_OWNED_BUSINESSES} საკუთარი ბიზნესი შეიძლება ჰქონდეს`,
  en: `One person can own at most ${MAX_OWNED_BUSINESSES} businesses`,
};

export const ROLE_LABEL: Record<Role, Bilingual> = {
  OWNER: { ka: "მფლობელი", en: "Owner" },
  ADMIN: { ka: "ადმინისტრატორი", en: "Admin" },
  OPERATOR: { ka: "ოპერატორი", en: "Operator" },
  VIEWER: { ka: "მნახველი", en: "Viewer" },
};
