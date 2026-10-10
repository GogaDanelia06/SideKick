import { prisma } from "@/lib/db";
import type { AdminSection } from "@/lib/admin/pages";
import { getHeroIntervalMs } from "@/lib/site/content";
import { statSourceOptions } from "@/lib/site/statSources";
import { findGroup } from "@/lib/site/textKeys";
import type { BoxItem } from "@/components/admin/boxes/BoxFields";
import type { SectionData } from "@/components/admin/sectionData";

type BoxRow = Pick<BoxItem, "id" | "order" | "published" | "icon" | "titleKa" | "titleEn">;

const boxItem = (row: BoxRow, bodyKa: string, bodyEn: string): BoxItem => ({
  id: row.id,
  order: row.order,
  published: row.published,
  icon: row.icon,
  titleKa: row.titleKa,
  titleEn: row.titleEn,
  bodyKa,
  bodyEn,
});

export async function loadCarousel(): Promise<SectionData> {
  const [slides, intervalMs, sources] = await Promise.all([
    prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
      include: { stats: { orderBy: { order: "asc" } } },
    }),
    getHeroIntervalMs(),
    statSourceOptions(),
  ]);
  return { kind: "carousel", slides, intervalSeconds: Math.round(intervalMs / 1000), sources };
}

export async function loadStats(): Promise<SectionData> {
  const [stats, sources] = await Promise.all([
    prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
    statSourceOptions(),
  ]);
  return { kind: "stats", stats, sources };
}

export async function loadText(section: AdminSection): Promise<SectionData | undefined> {
  const group = findGroup(section.textGroup!);
  if (!group) return undefined;
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: group.fields.map((f) => f.key) } },
  });
  return {
    kind: "text",
    group,
    values: Object.fromEntries(rows.map((r) => [r.key, { ka: r.valueKa, en: r.valueEn }])),
  };
}

export async function loadBoxes(section: AdminSection): Promise<SectionData> {
  const items =
    section.boxKind === "benefit"
      ? (await prisma.benefit.findMany({ orderBy: { order: "asc" } })).map((b) => boxItem(b, b.descKa, b.descEn))
      : (await prisma.serviceBox.findMany({ orderBy: { order: "asc" } })).map((s) => boxItem(s, s.bodyKa, s.bodyEn));
  return { kind: "boxes", boxKind: section.boxKind!, items };
}
