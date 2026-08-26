"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { ChannelType, StatMode, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { ADMIN_PAGES } from "@/lib/admin/pages";
import { findGroup, findLegalDoc, legalTitleKey } from "@/lib/site/textKeys";
import { THEME_KEY, sanitizeTheme } from "@/lib/site/theme/css";
import { ICON_NAMES } from "@/lib/content/icons";
import { STAT_SOURCE_KEYS } from "@/lib/site/statSources";
import { CHANNEL_TYPES } from "@/lib/dashboard/channels";
import { normalizeYouTubeUrl } from "@/lib/dashboard/youtube";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";

export type AdminResult = { ok: true } | { ok: false; error: string };

function revalidateStats() {
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

function field(fd: FormData, name: string): string {
  return String(fd.get(name) ?? "").trim();
}

/**
 * A strip figure is typed, counted, or drifting — exactly one of the three.
 *
 * The fields belonging to the other two modes are reset rather than left in
 * place, so a figure switched from counted back to typed cannot resurrect a
 * number nobody remembers setting.
 */
type StatData = {
  mode: StatMode;
  value: string;
  source: string;
  labelKa: string;
  labelEn: string;
  suffix: string;
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
  autoValue: number | null;
  autoNextAt: Date | null;
};

type SlideStatData = {
  labelKa: string;
  labelEn: string;
  source: string;
  suffix: string;
  baseValue: number;
  changeMin: number;
  changeMax: number;
  intervalMinMs: number;
  intervalMaxMs: number;
};

/** Shortest interval an admin may set, so a figure cannot flicker. */
const MIN_INTERVAL_S = 5;

function siteStatFields(fd: FormData): { data: StatData } | { error: string } {
  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!labelKa || !labelEn) return { error: "all_fields_required" };

  const mode = field(fd, "mode");
  if (mode !== "MANUAL" && mode !== "LIVE" && mode !== "AUTO") return { error: "bad_mode" };

  const suffix = field(fd, "suffix");
  const blank = {
    labelKa,
    labelEn,
    suffix,
    value: "",
    source: "",
    baseValue: 0,
    changeMin: 0,
    changeMax: 0,
    intervalMinMs: 60_000,
    intervalMaxMs: 300_000,
    // Wiping the running state is what makes a saved start value take effect.
    // Without it an admin would change "start from 1200", see nothing move, and
    // reasonably conclude the field does nothing.
    autoValue: null,
    autoNextAt: null,
  };

  if (mode === "LIVE") {
    const source = field(fd, "source");
    if (!source || !STAT_SOURCE_KEYS.includes(source)) return { error: "unknown_source" };
    return { data: { ...blank, mode, source } };
  }

  if (mode === "MANUAL") {
    const value = field(fd, "value");
    if (!value) return { error: "value_required" };
    return { data: { ...blank, mode, value } };
  }

  // Ranges are normalised so min never exceeds max — a reversed pair would pick
  // from an empty interval and freeze the figure.
  const changeA = num(fd, "changeMin", 0);
  const changeB = num(fd, "changeMax", 0);
  const secondsA = Math.max(MIN_INTERVAL_S, num(fd, "intervalMinS", 60));
  const secondsB = Math.max(MIN_INTERVAL_S, num(fd, "intervalMaxS", 300));

  return {
    data: {
      ...blank,
      mode,
      baseValue: num(fd, "baseValue", 0),
      changeMin: Math.min(changeA, changeB),
      changeMax: Math.max(changeA, changeB),
      intervalMinMs: Math.min(secondsA, secondsB) * 1000,
      intervalMaxMs: Math.max(secondsA, secondsB) * 1000,
    },
  };
}

export async function createStat(fd: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();

  const parsed = siteStatFields(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const max = await prisma.siteStat.aggregate({ _max: { order: true } });
  await prisma.siteStat.create({
    data: {
      key: `stat_${randomUUID().slice(0, 8)}`,
      ...parsed.data,
      order: (max._max.order ?? -1) + 1,
    },
  });

  log.info("admin created site stat", { userId: admin.userId });
  revalidateStats();
  return { ok: true };
}

export async function updateStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  const parsed = siteStatFields(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };

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

/**
 * One figure inside a carousel slide: counted, or drifting.
 *
 * A counted figure keeps the drift settings at zero rather than ignoring them,
 * so switching a figure back to hand-made later starts from a clean, obviously
 * static state instead of resurrecting numbers nobody remembers setting.
 */
function slideStatFields(fd: FormData): { data: SlideStatData } | { error: string } {
  const source = field(fd, "source");
  if (source && !STAT_SOURCE_KEYS.includes(source)) return { error: "unknown_source" };

  const labelKa = field(fd, "labelKa");
  const labelEn = field(fd, "labelEn");
  if (!labelKa || !labelEn) return { error: "label_required" };

  const common = { labelKa, labelEn, source, suffix: field(fd, "suffix") };
  if (source) {
    return {
      data: {
        ...common,
        baseValue: 0,
        changeMin: 0,
        changeMax: 0,
        intervalMinMs: 2000,
        intervalMaxMs: 6000,
      },
    };
  }

  // Ranges are normalised so min never exceeds max — otherwise the animation
  // would pick from an empty interval and freeze.
  const changeA = num(fd, "changeMin", 0);
  const changeB = num(fd, "changeMax", 0);
  const intervalA = Math.max(200, num(fd, "intervalMinMs", 2000));
  const intervalB = Math.max(200, num(fd, "intervalMaxMs", 6000));
  return {
    data: {
      ...common,
      baseValue: num(fd, "baseValue", 0),
      changeMin: Math.min(changeA, changeB),
      changeMax: Math.max(changeA, changeB),
      intervalMinMs: Math.min(intervalA, intervalB),
      intervalMaxMs: Math.max(intervalA, intervalB),
    },
  };
}

export async function createSlideStat(slideId: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = slideStatFields(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const max = await prisma.heroSlideStat.aggregate({ where: { slideId }, _max: { order: true } });
  await prisma.heroSlideStat.create({
    data: { ...parsed.data, slideId, order: (max._max.order ?? -1) + 1 },
  });
  revalidateHero();
  return { ok: true };
}

export async function updateSlideStat(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const parsed = slideStatFields(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };

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

/**
 * The document's own H1. Stored as a setting rather than a column because it
 * is one line of copy per document, exactly what SiteSetting exists for.
 */
export async function saveLegalTitle(doc: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!findLegalDoc(doc)) return { ok: false, error: "not_found" };

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

/** Paths an admin is allowed to write SEO for — taken from the registry, so a
 *  crafted request cannot create rows for arbitrary paths. */
function seoPaths(): string[] {
  return ADMIN_PAGES.flatMap((p) =>
    p.sections.filter((s) => s.kind === "seo").map((s) => s.seoPath ?? p.route),
  );
}

/** A canonical is either a site-relative path or a full http(s) URL. Anything
 *  else — javascript:, a bare word, a typo — is rejected rather than published,
 *  because a bad canonical quietly de-indexes the page. */
function validCanonical(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function updateSeo(path: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!seoPaths().includes(path)) return { ok: false, error: "unknown_page" };

  const canonical = field(fd, "canonical");
  if (!validCanonical(canonical)) return { ok: false, error: "bad_canonical" };

  const data = {
    title: field(fd, "title"),
    description: field(fd, "description"),
    canonical,
    indexable: field(fd, "indexable") !== "0",
    ogTitle: field(fd, "ogTitle"),
    ogDescription: field(fd, "ogDescription"),
    ogImageUrl: safeUrl(field(fd, "ogImageUrl"), ""),
  };

  await prisma.pageSeo.upsert({
    where: { path },
    create: { path, ...data },
    update: data,
  });

  revalidatePath("/admin");
  revalidatePath(path);
  return { ok: true };
}

/* ── Tutorials and channel guides (dashboard help) ──────────────────────── */

function revalidateTutorials() {
  revalidatePath("/admin/tutorials");
  revalidatePath(DASH.videos);
  revalidatePath(DASH.channels);
}

function tutorialFields(fd: FormData) {
  return {
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    descKa: field(fd, "descKa"),
    descEn: field(fd, "descEn"),
    categoryKa: field(fd, "categoryKa"),
    categoryEn: field(fd, "categoryEn"),
  };
}

export async function createTutorial(fd: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();

  const data = tutorialFields(fd);
  const youtubeUrl = normalizeYouTubeUrl(field(fd, "youtubeUrl"));
  if (!data.titleKa) return { ok: false, error: "title_required" };
  if (!youtubeUrl) return { ok: false, error: "bad_url" };

  const max = await prisma.tutorial.aggregate({ _max: { order: true } });
  await prisma.tutorial.create({
    data: { ...data, youtubeUrl, order: (max._max.order ?? -1) + 1 },
  });

  log.info("admin added tutorial", { userId: admin.userId });
  revalidateTutorials();
  return { ok: true };
}

export async function updateTutorial(id: string, fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  const data = tutorialFields(fd);
  const youtubeUrl = normalizeYouTubeUrl(field(fd, "youtubeUrl"));
  if (!data.titleKa) return { ok: false, error: "title_required" };
  if (!youtubeUrl) return { ok: false, error: "bad_url" };

  await prisma.tutorial.update({ where: { id }, data: { ...data, youtubeUrl } });
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

export async function moveTutorial(id: string, dir: "up" | "down"): Promise<AdminResult> {
  await requireAdmin();
  const all = await prisma.tutorial.findMany({ orderBy: { order: "asc" } });
  const i = all.findIndex((v) => v.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return { ok: true };
  await prisma.$transaction([
    prisma.tutorial.update({ where: { id: all[i]!.id }, data: { order: all[j]!.order } }),
    prisma.tutorial.update({ where: { id: all[j]!.id }, data: { order: all[i]!.order } }),
  ]);
  revalidateTutorials();
  return { ok: true };
}

/** One guide per channel type, so this upserts rather than creates: the admin
 *  edits four fixed rows that may or may not exist in the table yet. */
export async function saveChannelGuide(type: ChannelType, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!CHANNEL_TYPES.includes(type)) return { ok: false, error: "not_found" };

  const raw = field(fd, "youtubeUrl");
  const youtubeUrl = raw ? normalizeYouTubeUrl(raw) : "";
  if (raw && !youtubeUrl) return { ok: false, error: "bad_url" };

  const data = {
    youtubeUrl: youtubeUrl ?? "",
    bodyKa: field(fd, "bodyKa"),
    bodyEn: field(fd, "bodyEn"),
  };

  await prisma.channelGuide.upsert({
    where: { type },
    create: { type, ...data },
    update: data,
  });

  revalidateTutorials();
  return { ok: true };
}

export async function toggleChannelGuidePublished(
  type: ChannelType,
  published: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  if (!CHANNEL_TYPES.includes(type)) return { ok: false, error: "not_found" };
  await prisma.channelGuide.upsert({
    where: { type },
    create: { type, published },
    update: { published },
  });
  revalidateTutorials();
  return { ok: true };
}

/**
 * Puts a business on a plan, by hand.
 *
 * The banks are not wired up yet, so this is how a tenant gets the tier they
 * agreed to. Platform admin only, and deliberately not something a merchant can
 * reach: the same write on the billing page would be a button that hands out
 * premium for free.
 *
 * Creates the subscription when there is none — a business provisioned before
 * plans existed has no row, and refusing to help it would be the one case where
 * this screen is actually needed.
 */
export async function setBusinessPlan(
  businessId: string,
  planId: string,
  status: SubscriptionStatus,
  resetUsage: boolean,
): Promise<AdminResult> {
  const admin = await requireAdmin();

  const [business, plan] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { id: true } }),
    prisma.plan.findUnique({ where: { id: planId }, select: { id: true, key: true } }),
  ]);
  if (!business) return { ok: false, error: "ბიზნესი ვერ მოიძებნა" };
  if (!plan) return { ok: false, error: "გეგმა ვერ მოიძებნა" };

  await prisma.subscription.upsert({
    where: { businessId },
    // A plan is worth nothing while the old month's counter is still spent, so
    // clearing it is offered — and defaults to on, because the reason somebody
    // is moved up a tier is usually that they ran out of the one below.
    update: { planId, status, ...(resetUsage ? { msgUsed: 0 } : {}) },
    create: { businessId, planId, status, msgUsed: 0 },
  });

  log.info("admin set a business plan", {
    userId: admin.userId,
    businessId,
    plan: plan.key,
    status,
    resetUsage,
  });

  revalidatePath("/admin/businesses");
  return { ok: true };
}

/* ── Appearance ─────────────────────────────────────────────────────────── */

/**
 * The platform palette, for the marketing site and the dashboard alike.
 *
 * Stored as one row rather than one row per colour: the values are only ever
 * read and written together, and a half-applied palette — six colours saved and
 * twelve not — is a state nobody should be able to see.
 *
 * `sanitizeTheme` is what makes this safe. The result is written into a `<style>`
 * element on every page, so anything that is not a known token holding a
 * `#rrggbb` value is dropped and replaced with the shipped colour.
 */
export async function updateTheme(fd: FormData): Promise<AdminResult> {
  await requireAdmin();

  let parsed: unknown;
  try {
    parsed = JSON.parse(field(fd, "theme"));
  } catch {
    return { ok: false, error: "bad_theme" };
  }

  const value = JSON.stringify(sanitizeTheme(parsed));
  await prisma.siteSetting.upsert({
    where: { key: THEME_KEY },
    create: { key: THEME_KEY, valueKa: value },
    update: { valueKa: value },
  });

  // Every route sits under the root layout that reads this, so the whole tree
  // has to be refreshed — path by path would miss pages nobody thought of.
  revalidatePath("/", "layout");
  return { ok: true };
}
