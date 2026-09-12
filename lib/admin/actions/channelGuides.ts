"use server";

import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { field } from "@/lib/admin/forms/fields";
import { revalidateTutorials } from "@/lib/admin/revalidate";
import { CHANNEL_TYPES } from "@/lib/dashboard/channels";
import { normalizeYouTubeUrl } from "@/lib/dashboard/youtube";
import { fail, type AdminResult } from "./shared";

/** Upserts: one guide per channel type, and its row may not exist yet. */
export async function saveChannelGuide(type: ChannelType, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  if (!CHANNEL_TYPES.includes(type)) return fail("not_found");

  const raw = field(fd, "youtubeUrl");
  const youtubeUrl = raw ? normalizeYouTubeUrl(raw) : "";
  if (youtubeUrl === null) return fail("bad_url");

  const data = { youtubeUrl, bodyKa: field(fd, "bodyKa"), bodyEn: field(fd, "bodyEn") };
  await prisma.channelGuide.upsert({ where: { type }, create: { type, ...data }, update: data });

  revalidateTutorials();
  return { ok: true };
}

export async function toggleChannelGuidePublished(type: ChannelType, published: boolean): Promise<AdminResult> {
  await requireAdmin();
  if (!CHANNEL_TYPES.includes(type)) return fail("not_found");

  await prisma.channelGuide.upsert({ where: { type }, create: { type, published }, update: { published } });
  revalidateTutorials();
  return { ok: true };
}
