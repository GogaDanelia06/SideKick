"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parseFaq } from "@/lib/admin/forms/content";
import { revalidateFaq } from "@/lib/admin/revalidate";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

export async function createFaq(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseFaq(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.siteFaq.aggregate({ _max: { order: true } });
  await prisma.siteFaq.create({ data: { ...parsed.data, order: nextOrder(_max.order) } });
  revalidateFaq();
  return { ok: true };
}

export async function updateFaq(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseFaq(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.siteFaq.update({ where: { id }, data: parsed.data });
  revalidateFaq();
  return { ok: true };
}

export async function deleteFaq(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.siteFaq.delete({ where: { id } });
  revalidateFaq();
  return { ok: true };
}

export async function toggleFaqPublished(id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  await prisma.siteFaq.update({ where: { id }, data: { published } });
  revalidateFaq();
  return { ok: true };
}

export async function moveFaq(id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const rows = await prisma.siteFaq.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT });
  const moved = await moveRow(rows, id, dir, (rowId, order) =>
    prisma.siteFaq.update({ where: { id: rowId }, data: { order } }),
  );
  if (moved === "not_found") return fail("not_found");
  if (moved === "moved") revalidateFaq();
  return { ok: true };
}
