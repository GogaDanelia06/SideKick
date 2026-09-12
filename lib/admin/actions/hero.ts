"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field } from "@/lib/admin/forms/fields";
import { parseSlide } from "@/lib/admin/forms/content";
import { revalidateHero } from "@/lib/admin/revalidate";
import { ORDER_ASC, ORDER_SELECT, fail, moveRow, nextOrder, type AdminResult, type Direction } from "./shared";

const INTERVAL_KEY = "hero_interval_s";

export async function createSlide(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseSlide(fd);
  if ("error" in parsed) return fail(parsed.error);

  const { _max } = await prisma.heroSlide.aggregate({ _max: { order: true } });
  await prisma.heroSlide.create({ data: { ...parsed.data, order: nextOrder(_max.order) } });
  revalidateHero();
  return { ok: true };
}

export async function updateSlide(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = parseSlide(fd);
  if ("error" in parsed) return fail(parsed.error);

  await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  revalidateHero();
  return { ok: true };
}

export async function deleteSlide(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id } });
  revalidateHero();
  return { ok: true };
}

export async function toggleSlidePublished(id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  await prisma.heroSlide.update({ where: { id }, data: { published } });
  revalidateHero();
  return { ok: true };
}

export async function moveSlide(id: string, dir: Direction): Promise<AdminResult> {
  await requireAdmin();
  const rows = await prisma.heroSlide.findMany({ orderBy: ORDER_ASC, select: ORDER_SELECT });
  const moved = await moveRow(rows, id, dir, (rowId, order) =>
    prisma.heroSlide.update({ where: { id: rowId }, data: { order } }),
  );
  if (moved === "not_found") return fail("not_found");
  if (moved === "moved") revalidateHero();
  return { ok: true };
}

/** Carousel auto-advance, in seconds (1–60). */
export async function updateHeroInterval(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const seconds = Number(field(fd, "seconds"));
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 60) return fail("bad_interval");

  const valueKa = String(seconds);
  await prisma.siteSetting.upsert({
    where: { key: INTERVAL_KEY },
    create: { key: INTERVAL_KEY, valueKa },
    update: { valueKa },
  });
  revalidateHero();
  return { ok: true };
}
