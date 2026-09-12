import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";
import { youtubeThumbnail } from "./youtube";

export type TutorialView = {
  id: string;
  title: Bilingual;
  description: Bilingual;
  category: Bilingual | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
};

export type ChannelGuideView = {
  body: Bilingual;
  youtubeUrl: string;
};

/** English falls back to Georgian, so a half-translated row still reads. */
function bi(ka: string, en: string): Bilingual {
  return { ka, en: en || ka };
}

/** Published tutorials in admin order; shared by every business. */
export async function getTutorials(): Promise<TutorialView[]> {
  const rows = await prisma.tutorial.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { titleKa: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    title: bi(r.titleKa, r.titleEn),
    description: bi(r.descKa, r.descEn),
    category: r.categoryKa.trim() ? bi(r.categoryKa, r.categoryEn) : null,
    youtubeUrl: r.youtubeUrl,
    thumbnailUrl: youtubeThumbnail(r.youtubeUrl),
  }));
}

/** Published connection guides by channel type. */
export async function getChannelGuides(): Promise<Partial<Record<ChannelType, ChannelGuideView>>> {
  const rows = await prisma.channelGuide.findMany({ where: { published: true } });
  const out: Partial<Record<ChannelType, ChannelGuideView>> = {};

  for (const r of rows) {
    if (!r.bodyKa.trim() && !r.youtubeUrl) continue;
    out[r.type] = { body: bi(r.bodyKa, r.bodyEn), youtubeUrl: r.youtubeUrl };
  }
  return out;
}

/** One step per non-empty line. */
export function guideSteps(body: Bilingual): { ka: string[]; en: string[] } {
  const split = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  return { ka: split(body.ka), en: split(body.en) };
}
