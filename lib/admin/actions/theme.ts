"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field } from "@/lib/admin/forms/fields";
import { revalidateTheme } from "@/lib/admin/revalidate";
import { THEME_KEY, sanitizeTheme } from "@/lib/site/theme/css";
import { fail, type AdminResult } from "./shared";

/** Saves the platform theme as one row; `sanitizeTheme` makes it safe to write into `<style>`. */
export async function updateTheme(fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  let input: unknown;
  try {
    input = JSON.parse(field(fd, "theme"));
  } catch {
    return fail("bad_theme");
  }

  const valueKa = JSON.stringify(sanitizeTheme(input));
  await prisma.siteSetting.upsert({
    where: { key: THEME_KEY },
    create: { key: THEME_KEY, valueKa },
    update: { valueKa },
  });

  revalidateTheme();
  return { ok: true };
}
