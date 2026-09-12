"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parseSlideStat } from "@/lib/admin/forms/stats";
import { revalidateHero } from "@/lib/admin/revalidate";
import { fail, nextOrder, type AdminResult } from "./shared";

export async function createSlideStat(slideId: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseSlideStat(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.heroSlideStat.aggregate({ where: { slideId }, _max: { order: true } });
  await prisma.heroSlideStat.create({ data: { ...parsed.data, slideId, order: nextOrder(_max.order) } });
  revalidateHero();
  return { ok: true };
}

export async function updateSlideStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseSlideStat(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.heroSlideStat.update({ where: { id }, data: parsed.data });
  revalidateHero();
  return { ok: true };
}

export async function deleteSlideStat(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.heroSlideStat.delete({ where: { id } });
  revalidateHero();
  return { ok: true };
}
