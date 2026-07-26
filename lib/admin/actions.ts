"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { SEO_KEYS } from "@/lib/site/content";
import { log } from "@/lib/logger";

export type AdminResult = { ok: true } | { ok: false; error: string };

function revalidateStats() {
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

function field(fd: FormData, name: string): string {
  return String(fd.get(name) ?? "").trim();
}

export async function createStat(fd: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();

  const value = field(fd, "value");
  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!value || !labelKa || !labelEn) return { ok: false, error: "all_fields_required" };

  const max = await prisma.siteStat.aggregate({ _max: { order: true } });
  await prisma.siteStat.create({
    data: {
      key: `stat_${randomUUID().slice(0, 8)}`,
      value,
      labelKa,
      labelEn,
      order: (max._max.order ?? -1) + 1,
    },
  });

  log.info("admin created site stat", { userId: admin.userId });
  revalidateStats();
  return { ok: true };
}

export async function updateStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  const value = field(fd, "value");
  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!value || !labelKa || !labelEn) return { ok: false, error: "all_fields_required" };

  await prisma.siteStat.update({ where: { id }, data: { value, labelKa, labelEn } });
  revalidateStats();
  return { ok: true };
}

export async function deleteStat(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.siteStat.delete({ where: { id } });
  revalidateStats();
  return { ok: true };
}

export async function moveStat(id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();

  const all = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  const i = all.findIndex((s) => s.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };

  await prisma.$transaction([
    prisma.siteStat.update({ where: { id: all[i]!.id }, data: { order: all[j]!.order } }),
    prisma.siteStat.update({ where: { id: all[j]!.id }, data: { order: all[i]!.order } }),
  ]);
  revalidateStats();
  return { ok: true };
}

function intOrUnlimited(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < -1) return null;
  return n;
}

export async function updatePlan(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  const name = field(fd, "name");
  const nameEn = field(fd, "nameEn");
  const price = Number(field(fd, "price"));
  const msgLimit = intOrUnlimited(field(fd, "msgLimit"));
  const channelCap = intOrUnlimited(field(fd, "channelCap"));
  const userCap = intOrUnlimited(field(fd, "userCap"));
  const productCap = intOrUnlimited(field(fd, "productCap"));
  const featured = fd.get("featured") === "on";

  if (!name) return { ok: false, error: "name_required" };
  if (!Number.isInteger(price) || price < 0) return { ok: false, error: "bad_price" };
  if (msgLimit === null || channelCap === null || userCap === null || productCap === null) {
    return { ok: false, error: "bad_cap" };
  }

  await prisma.plan.update({
    where: { id },
    data: { name, nameEn, price, msgLimit, channelCap, userCap, productCap, featured },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
  return { ok: true };
}

function revalidateFaq() {
  revalidatePath("/admin/faq");
  revalidatePath("/contact");
}

function faqFields(fd: FormData) {
  return {
    questionKa: field(fd, "questionKa"),
    questionEn: field(fd, "questionEn"),
    answerKa: field(fd, "answerKa"),
    answerEn: field(fd, "answerEn"),
  };
}

export async function createFaq(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = faqFields(fd);
  if (!data.questionKa || !data.questionEn || !data.answerKa || !data.answerEn) {
    return { ok: false, error: "all_fields_required" };
  }
  const max = await prisma.siteFaq.aggregate({ _max: { order: true } });
  await prisma.siteFaq.create({ data: { ...data, order: (max._max.order ?? -1) + 1 } });
  revalidateFaq();
  return { ok: true };
}

export async function updateFaq(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = faqFields(fd);
  if (!data.questionKa || !data.questionEn || !data.answerKa || !data.answerEn) {
    return { ok: false, error: "all_fields_required" };
  }
  await prisma.siteFaq.update({ where: { id }, data });
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

export async function moveFaq(id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();
  const all = await prisma.siteFaq.findMany({ orderBy: { order: "asc" } });
  const i = all.findIndex((f) => f.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };
  await prisma.$transaction([
    prisma.siteFaq.update({ where: { id: all[i]!.id }, data: { order: all[j]!.order } }),
    prisma.siteFaq.update({ where: { id: all[j]!.id }, data: { order: all[i]!.order } }),
  ]);
  revalidateFaq();
  return { ok: true };
}

export async function updateSeo(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const title = field(fd, "title");
  const description = field(fd, "description");

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: SEO_KEYS.title },
      create: { key: SEO_KEYS.title, valueKa: title },
      update: { valueKa: title },
    }),
    prisma.siteSetting.upsert({
      where: { key: SEO_KEYS.description },
      create: { key: SEO_KEYS.description, valueKa: description },
      update: { valueKa: description },
    }),
  ]);

  revalidatePath("/admin/seo");
  revalidatePath("/");
  return { ok: true };
}
