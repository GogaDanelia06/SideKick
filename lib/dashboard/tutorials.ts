import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Bilingual } from "@/lib/content/types";

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

/** Derived rather than stored: YouTube serves a thumbnail for every video id,
 *  so there is nothing for an admin to upload or keep in sync. */
export function youtubeThumbnail(url: string): string | null {
  try {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

/** Published tutorials, in admin-chosen order. Platform-wide — every tenant
 *  sees the same list, which is why nothing here is scoped to a business. */
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

/** Connection instructions keyed by channel type. A type is absent when the
 *  admin hasn't written a guide yet, and the channel row simply shows none. */
export async function getChannelGuides(): Promise<Partial<Record<ChannelType, ChannelGuideView>>> {
  const rows = await prisma.channelGuide.findMany({ where: { published: true } });
  const out: Partial<Record<ChannelType, ChannelGuideView>> = {};

  for (const r of rows) {
    if (!r.bodyKa.trim() && !r.youtubeUrl) continue;
    out[r.type] = { body: bi(r.bodyKa, r.bodyEn), youtubeUrl: r.youtubeUrl };
  }
  return out;
}

/** Steps are stored one per line; blank lines are ignored so trailing
 *  newlines in the textarea don't render as empty bullets. */
export function guideSteps(body: Bilingual): { ka: string[]; en: string[] } {
  const split = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  return { ka: split(body.ka), en: split(body.en) };
}
