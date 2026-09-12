"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field } from "@/lib/admin/forms/fields";
import { revalidateTexts } from "@/lib/admin/revalidate";
import { findGroup } from "@/lib/site/textKeys";
import { fail, type AdminResult } from "./shared";

/** Saves one registry text group; only that group's keys can be written. */
export async function saveTextGroup(slug: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const group = findGroup(slug);
  if (!group) return fail("unknown_group");

  await prisma.$transaction(
    group.fields.map(({ key, singleLang }) => {
      const valueKa = field(fd, key);
      const valueEn = singleLang ? "" : field(fd, `${key}__en`);
      return prisma.siteSetting.upsert({
        where: { key },
        create: { key, valueKa, valueEn },
        update: { valueKa, valueEn },
      });
    }),
  );

  revalidateTexts();
  return { ok: true };
}
