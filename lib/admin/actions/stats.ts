"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parseSiteStat } from "@/lib/admin/forms/stats";
import { revalidateStats } from "@/lib/admin/revalidate";
import { log } from "@/lib/logger";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

export async function createStat(fd: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = parseSiteStat(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.siteStat.aggregate({ _max: { order: true } });
  await prisma.siteStat.create({
    data: { key: `stat_${randomUUID().slice(0, 8)}`, ...parsed.data, order: nextOrder(_max.order) },
  });

  log.info("admin created site stat", { userId: admin.userId });
  revalidateStats();
  return { ok: true };
}

export async function updateStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseSiteStat(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.siteStat.update({ where: { id }, data: parsed.data });
  revalidateStats();
  return { ok: true };
}

export async function deleteStat(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.siteStat.delete({ where: { id } });
  revalidateStats();
  return { ok: true };
}

export async function moveStat(id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const rows = await prisma.siteStat.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT });
  const moved = await moveRow(rows, id, dir, (rowId, order) =>
    prisma.siteStat.update({ where: { id: rowId }, data: { order } }),
  );
  if (moved === "not_found") return fail("not_found");
  if (moved === "moved") revalidateStats();
  return { ok: true };
}
