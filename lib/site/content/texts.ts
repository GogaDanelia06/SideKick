import { prisma } from "@/lib/db";
import { bilingual } from "@/lib/content/bilingual";
import type { Bilingual } from "@/lib/content/types";

/** Saved, non-empty texts by key; callers fall back to built-in copy with `??`. */
export async function getSiteTexts(keys: string[]): Promise<Record<string, Bilingual>> {
  if (keys.length === 0) return {};
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(
    rows
      .filter((r) => r.valueKa.trim())
      .map((r) => [r.key, bilingual(r.valueKa.trim(), r.valueEn.trim())]),
  );
}

/** Single-language value (URLs, phone numbers, emails). */
export async function getSiteValue(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.valueKa.trim() || null;
}
