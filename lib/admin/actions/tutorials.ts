"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parseTutorial } from "@/lib/admin/forms/content";
import { revalidateTutorials } from "@/lib/admin/revalidate";
import { log } from "@/lib/logger";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

export async function createTutorial(fd: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = parseTutorial(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.tutorial.aggregate({ _max: { order: true } });
  await prisma.tutorial.create({ data: { ...parsed.data, order: nextOrder(_max.order) } });

  log.info("admin added tutorial", { userId: admin.userId });
  revalidateTutorials();
  return { ok: true };
}

export async function updateTutorial(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseTutorial(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.tutorial.update({ where: { id }, data: parsed.data });
  revalidateTutorials();
  return { ok: true };
}

export async function deleteTutorial(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.tutorial.delete({ where: { id } });
  revalidateTutorials();
  return { ok: true };
}

export async function toggleTutorialPublished(id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  await prisma.tutorial.update({ where: { id }, data: { published } });
  revalidateTutorials();
  return { ok: true };
}

export async function moveTutorial(id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const rows = await prisma.tutorial.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT });
  const moved = await moveRow(rows, id, dir, (rowId, order) =>
    prisma.tutorial.update({ where: { id: rowId }, data: { order } }),
  );
  if (moved === "not_found") return fail("not_found");
  if (moved === "moved") revalidateTutorials();
  return { ok: true };
}
