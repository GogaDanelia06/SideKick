"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field } from "@/lib/admin/forms/fields";
import { parseLegalSection } from "@/lib/admin/forms/content";
import { revalidateLegal } from "@/lib/admin/revalidate";
import { findLegalDoc, legalTitleKey } from "@/lib/site/textKeys";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

const DOC = { doc: true } as const;

export async function createLegalSection(doc: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!findLegalDoc(doc)) return fail("unknown_doc");
  const parsed = parseLegalSection(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.legalSection.aggregate({ where: { doc }, _max: { order: true } });
  await prisma.legalSection.create({ data: { ...parsed.data, doc, order: nextOrder(_max.order) } });
  revalidateLegal(doc);
  return { ok: true };
}

export async function updateLegalSection(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseLegalSection(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { doc } = await prisma.legalSection.update({ where: { id }, data: parsed.data, select: DOC });
  revalidateLegal(doc);
  return { ok: true };
}

export async function deleteLegalSection(id: string): Promise<AdminResult> {
  await requireAdmin();
  const { doc } = await prisma.legalSection.delete({ where: { id }, select: DOC });
  revalidateLegal(doc);
  return { ok: true };
}

export async function toggleLegalPublished(id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  const { doc } = await prisma.legalSection.update({ where: { id }, data: { published }, select: DOC });
  revalidateLegal(doc);
  return { ok: true };
}

export async function moveLegalSection(id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const current = await prisma.legalSection.findUnique({ where: { id }, select: DOC });
  if (!current) return fail("not_found");

  const rows = await prisma.legalSection.findMany({
    where: { doc: current.doc },
    orderBy: ORDER_ASC,
    select: ORDER_SELECT,
  });
  const moved = await moveRow(rows, id, dir, (rowId, order) =>
    prisma.legalSection.update({ where: { id: rowId }, data: { order } }),
  );
  if (moved === "moved") revalidateLegal(current.doc);
  return { ok: true };
}

export async function saveLegalTitle(doc: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!findLegalDoc(doc)) return fail("not_found");

  const key = legalTitleKey(doc);
  const valueKa = field(fd, "titleKa");
  const valueEn = field(fd, "titleEn");
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, valueKa, valueEn },
    update: { valueKa, valueEn },
  });
  revalidateLegal(doc);
  return { ok: true };
}
