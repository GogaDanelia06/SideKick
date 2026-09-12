"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { parseBox, type BoxData, type BoxKind } from "@/lib/admin/forms/content";
import { revalidateBoxes } from "@/lib/admin/revalidate";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

/** Benefits keep the body in `desc*` columns; service boxes in `body*`. */
function benefitColumns({ bodyKa, bodyEn, ...rest }: BoxData) {
  return { ...rest, descKa: bodyKa, descEn: bodyEn };
}

export async function createBox(kind: BoxKind, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseBox(fd);
  if ("error" in parsed) return fail(parsed.error);

  if (kind === "benefit") {
    const { _max } = await prisma.benefit.aggregate({ _max: { order: true } });
    await prisma.benefit.create({ data: { ...benefitColumns(parsed.data), order: nextOrder(_max.order) } });
  } else {
    const { _max } = await prisma.serviceBox.aggregate({ _max: { order: true } });
    await prisma.serviceBox.create({ data: { ...parsed.data, order: nextOrder(_max.order) } });
  }
  revalidateBoxes(kind);
  return { ok: true };
}

export async function updateBox(kind: BoxKind, id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseBox(fd);
  if ("error" in parsed) return fail(parsed.error);

  if (kind === "benefit") await prisma.benefit.update({ where: { id }, data: benefitColumns(parsed.data) });
  else await prisma.serviceBox.update({ where: { id }, data: parsed.data });
  revalidateBoxes(kind);
  return { ok: true };
}

export async function deleteBox(kind: BoxKind, id: string): Promise<AdminResult> {
  await requireAdmin();
  if (kind === "benefit") await prisma.benefit.delete({ where: { id } });
  else await prisma.serviceBox.delete({ where: { id } });
  revalidateBoxes(kind);
  return { ok: true };
}

export async function toggleBoxPublished(kind: BoxKind, id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  if (kind === "benefit") await prisma.benefit.update({ where: { id }, data: { published } });
  else await prisma.serviceBox.update({ where: { id }, data: { published } });
  revalidateBoxes(kind);
  return { ok: true };
}

export async function moveBox(kind: BoxKind, id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const moved =
    kind === "benefit"
      ? await moveRow(
          await prisma.benefit.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT }),
          id,
          dir,
          (rowId, order) => prisma.benefit.update({ where: { id: rowId }, data: { order } }),
        )
      : await moveRow(
          await prisma.serviceBox.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT }),
          id,
          dir,
          (rowId, order) => prisma.serviceBox.update({ where: { id: rowId }, data: { order } }),
        );
  if (moved === "not_found") return fail("not_found");
  if (moved === "moved") revalidateBoxes(kind);
  return { ok: true };
}
