"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { SEO_KEYS } from "@/lib/site/content";
import { findGroup, findLegalDoc } from "@/lib/site/textKeys";
import { ICON_NAMES } from "@/lib/content/icons";
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

  // Empty means "no special price for this term" — the card then falls back to
  // monthly × months, so clearing the field is a valid way to remove a discount.
  const optionalPrice = (key: string): number | null | undefined => {
    const raw = field(fd, key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 ? n : undefined; // undefined = invalid
  };
  const price3m = optionalPrice("price3m");
  const price12m = optionalPrice("price12m");

  // Five free-form bullet slots per plan; blanks are dropped so the card never
  // renders an empty line.
  const extrasKa: string[] = [];
  const extrasEn: string[] = [];
  for (let i = 0; i < 5; i++) {
    const ka = field(fd, `extraKa${i}`);
    if (!ka) continue;
    extrasKa.push(ka);
    extrasEn.push(field(fd, `extraEn${i}`) || ka);
  }

  if (!name) return { ok: false, error: "name_required" };
  if (!Number.isInteger(price) || price < 0) return { ok: false, error: "bad_price" };
  if (price3m === undefined || price12m === undefined) return { ok: false, error: "bad_price" };
  if (msgLimit === null || channelCap === null || userCap === null || productCap === null) {
    return { ok: false, error: "bad_cap" };
  }

  await prisma.plan.update({
    where: { id },
    data: {
      name,
      nameEn,
      price,
      price3m,
      price12m,
      msgLimit,
      channelCap,
      userCap,
      productCap,
      extrasKa,
      extrasEn,
      featured,
    },
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

/**
 * Save one group of editable texts.
 *
 * Only keys declared in the registry for that slug are written — a crafted form
 * can't reach an unrelated setting. An empty value is stored as empty, which
 * makes the public page fall back to its hardcoded default.
 */
export async function saveTextGroup(slug: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  const group = findGroup(slug);
  if (!group) return { ok: false, error: "unknown_group" };

  await prisma.$transaction(
    group.fields.map((f) => {
      const valueKa = field(fd, f.key);
      const valueEn = f.singleLang ? "" : field(fd, `${f.key}__en`);
      return prisma.siteSetting.upsert({
        where: { key: f.key },
        create: { key: f.key, valueKa, valueEn },
        update: { valueKa, valueEn },
      });
    }),
  );

  revalidatePath(`/admin/content/${slug}`);
  // Content can appear on several pages; refresh the whole marketing surface.
  for (const p of ["/", "/pricing", "/contact", "/about", "/register", "/terms", "/privacy", "/data-protection"]) {
    revalidatePath(p);
  }
  return { ok: true };
}

/* ── Hero carousel ──────────────────────────────────────────────────────── */

function revalidateHero() {
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

/** Only paths on this site or absolute http(s) URLs — never `javascript:`. */
function safeUrl(raw: string, fallback: string): string {
  const v = raw.trim();
  if (!v) return fallback;
  if (v.startsWith("/")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? v : fallback;
  } catch {
    return fallback;
  }
}

const MOCKS = new Set(["chat", "dashboard", "tester"]);

function slideFields(fd: FormData) {
  const mock = field(fd, "mock");
  return {
    mediaUrl: field(fd, "mediaUrl") ? safeUrl(field(fd, "mediaUrl"), "") : null,
    mediaType: field(fd, "mediaType") || null,
    mock: MOCKS.has(mock) ? mock : null,
    badgeKa: field(fd, "badgeKa"),
    badgeEn: field(fd, "badgeEn"),
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    textKa: field(fd, "textKa"),
    textEn: field(fd, "textEn"),
    ctaLabelKa: field(fd, "ctaLabelKa"),
    ctaLabelEn: field(fd, "ctaLabelEn"),
    ctaUrl: safeUrl(field(fd, "ctaUrl"), "/pricing"),
  };
}

export async function createSlide(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = slideFields(fd);
  if (!data.titleKa || !data.titleEn) return { ok: false, error: "title_required" };

  const max = await prisma.heroSlide.aggregate({ _max: { order: true } });
  await prisma.heroSlide.create({ data: { ...data, order: (max._max.order ?? -1) + 1 } });
  revalidateHero();
  return { ok: true };
}

export async function updateSlide(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = slideFields(fd);
  if (!data.titleKa || !data.titleEn) return { ok: false, error: "title_required" };

  await prisma.heroSlide.update({ where: { id }, data });
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

export async function moveSlide(id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();
  const all = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  const i = all.findIndex((s) => s.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };

  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: all[i]!.id }, data: { order: all[j]!.order } }),
    prisma.heroSlide.update({ where: { id: all[j]!.id }, data: { order: all[i]!.order } }),
  ]);
  revalidateHero();
  return { ok: true };
}

/* ── Per-slide animated stats ───────────────────────────────────────────── */

function num(fd: FormData, key: string, fallback: number): number {
  const n = Number(field(fd, key));
  return Number.isFinite(n) ? n : fallback;
}

function statFields(fd: FormData) {
  // Ranges are normalised so min never exceeds max — otherwise the animation
  // would pick from an empty interval and freeze.
  const changeA = num(fd, "changeMin", 0);
  const changeB = num(fd, "changeMax", 0);
  const intervalA = Math.max(200, num(fd, "intervalMinMs", 2000));
  const intervalB = Math.max(200, num(fd, "intervalMaxMs", 6000));
  return {
    labelKa: field(fd, "labelKa"),
    labelEn: field(fd, "labelEn"),
    baseValue: num(fd, "baseValue", 0),
    changeMin: Math.min(changeA, changeB),
    changeMax: Math.max(changeA, changeB),
    intervalMinMs: Math.min(intervalA, intervalB),
    intervalMaxMs: Math.max(intervalA, intervalB),
    suffix: field(fd, "suffix"),
  };
}

export async function createSlideStat(slideId: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = statFields(fd);
  if (!data.labelKa || !data.labelEn) return { ok: false, error: "label_required" };

  const max = await prisma.heroSlideStat.aggregate({ where: { slideId }, _max: { order: true } });
  await prisma.heroSlideStat.create({
    data: { ...data, slideId, order: (max._max.order ?? -1) + 1 },
  });
  revalidateHero();
  return { ok: true };
}

export async function updateSlideStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = statFields(fd);
  if (!data.labelKa || !data.labelEn) return { ok: false, error: "label_required" };

  await prisma.heroSlideStat.update({ where: { id }, data });
  revalidateHero();
  return { ok: true };
}

export async function deleteSlideStat(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.heroSlideStat.delete({ where: { id } });
  revalidateHero();
  return { ok: true };
}

/** Carousel auto-advance, in seconds. Stored as a plain setting. */
export async function updateHeroInterval(fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const seconds = Number(field(fd, "seconds"));
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 60) {
    return { ok: false, error: "bad_interval" };
  }
  await prisma.siteSetting.upsert({
    where: { key: "hero_interval_s" },
    create: { key: "hero_interval_s", valueKa: String(seconds) },
    update: { valueKa: String(seconds) },
  });
  revalidateHero();
  return { ok: true };
}

/* ── Content boxes (landing benefits + pricing services) ────────────────── */

/**
 * Benefits and service boxes are the same shape, so one set of actions drives
 * both — `kind` picks the table. Keeps the two editors identical for the admin
 * and halves the code behind them.
 */
export type BoxKind = "benefit" | "service";

function revalidateBox(kind: BoxKind) {
  revalidatePath(`/admin/boxes/${kind}`);
  revalidatePath(kind === "benefit" ? "/" : "/pricing");
}

/**
 * The two tables are identical except for the body column name (`desc*` vs
 * `body*`), so the form is read once here and each action branches on `kind`
 * when it touches Prisma — branching keeps both calls fully typed, which casts
 * would not.
 */
function boxInput(fd: FormData) {
  const icon = field(fd, "icon");
  return {
    icon: ICON_NAMES.includes(icon) ? icon : "IconSparkles",
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    bodyKa: field(fd, "bodyKa"),
    bodyEn: field(fd, "bodyEn"),
  };
}

export async function createBox(kind: BoxKind, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const { icon, titleKa, titleEn, bodyKa, bodyEn } = boxInput(fd);
  if (!titleKa || !titleEn) return { ok: false, error: "title_required" };

  if (kind === "benefit") {
    const max = await prisma.benefit.aggregate({ _max: { order: true } });
    await prisma.benefit.create({
      data: { icon, titleKa, titleEn, descKa: bodyKa, descEn: bodyEn, order: (max._max.order ?? -1) + 1 },
    });
  } else {
    const max = await prisma.serviceBox.aggregate({ _max: { order: true } });
    await prisma.serviceBox.create({
      data: { icon, titleKa, titleEn, bodyKa, bodyEn, order: (max._max.order ?? -1) + 1 },
    });
  }
  revalidateBox(kind);
  return { ok: true };
}

export async function updateBox(kind: BoxKind, id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const { icon, titleKa, titleEn, bodyKa, bodyEn } = boxInput(fd);
  if (!titleKa || !titleEn) return { ok: false, error: "title_required" };

  if (kind === "benefit") {
    await prisma.benefit.update({
      where: { id },
      data: { icon, titleKa, titleEn, descKa: bodyKa, descEn: bodyEn },
    });
  } else {
    await prisma.serviceBox.update({
      where: { id },
      data: { icon, titleKa, titleEn, bodyKa, bodyEn },
    });
  }
  revalidateBox(kind);
  return { ok: true };
}

export async function deleteBox(kind: BoxKind, id: string): Promise<AdminResult> {
  await requireAdmin();
  if (kind === "benefit") await prisma.benefit.delete({ where: { id } });
  else await prisma.serviceBox.delete({ where: { id } });
  revalidateBox(kind);
  return { ok: true };
}

export async function toggleBoxPublished(
  kind: BoxKind,
  id: string,
  published: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  if (kind === "benefit") await prisma.benefit.update({ where: { id }, data: { published } });
  else await prisma.serviceBox.update({ where: { id }, data: { published } });
  revalidateBox(kind);
  return { ok: true };
}

export async function moveBox(kind: BoxKind, id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();

  const all =
    kind === "benefit"
      ? await prisma.benefit.findMany({ orderBy: { order: "asc" }, select: { id: true, order: true } })
      : await prisma.serviceBox.findMany({ orderBy: { order: "asc" }, select: { id: true, order: true } });

  const i = all.findIndex((b) => b.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };

  const a = all[i]!;
  const b = all[j]!;
  if (kind === "benefit") {
    await prisma.$transaction([
      prisma.benefit.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.benefit.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.serviceBox.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.serviceBox.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  }
  revalidateBox(kind);
  return { ok: true };
}

/* ── Legal documents ────────────────────────────────────────────────────── */

function revalidateLegal(doc: string) {
  revalidatePath(`/admin/legal/${doc}`);
  revalidatePath(`/${doc}`);
}

function legalFields(fd: FormData) {
  return {
    headingKa: field(fd, "headingKa"),
    headingEn: field(fd, "headingEn"),
    bodyKa: field(fd, "bodyKa"),
    bodyEn: field(fd, "bodyEn"),
    bulletsKa: field(fd, "bulletsKa"),
    bulletsEn: field(fd, "bulletsEn"),
  };
}

export async function createLegalSection(doc: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!findLegalDoc(doc)) return { ok: false, error: "unknown_doc" };

  const data = legalFields(fd);
  if (!data.headingKa || !data.headingEn) return { ok: false, error: "heading_required" };

  const max = await prisma.legalSection.aggregate({ where: { doc }, _max: { order: true } });
  await prisma.legalSection.create({ data: { ...data, doc, order: (max._max.order ?? -1) + 1 } });
  revalidateLegal(doc);
  return { ok: true };
}

export async function updateLegalSection(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const data = legalFields(fd);
  if (!data.headingKa || !data.headingEn) return { ok: false, error: "heading_required" };

  const row = await prisma.legalSection.update({ where: { id }, data });
  revalidateLegal(row.doc);
  return { ok: true };
}

export async function deleteLegalSection(id: string): Promise<AdminResult> {
  await requireAdmin();
  const row = await prisma.legalSection.delete({ where: { id } });
  revalidateLegal(row.doc);
  return { ok: true };
}

export async function toggleLegalPublished(id: string, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  const row = await prisma.legalSection.update({ where: { id }, data: { published } });
  revalidateLegal(row.doc);
  return { ok: true };
}

export async function moveLegalSection(id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();
  const current = await prisma.legalSection.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "not_found" };

  const all = await prisma.legalSection.findMany({
    where: { doc: current.doc },
    orderBy: { order: "asc" },
  });
  const i = all.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };

  await prisma.$transaction([
    prisma.legalSection.update({ where: { id: all[i]!.id }, data: { order: all[j]!.order } }),
    prisma.legalSection.update({ where: { id: all[j]!.id }, data: { order: all[i]!.order } }),
  ]);
  revalidateLegal(current.doc);
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
