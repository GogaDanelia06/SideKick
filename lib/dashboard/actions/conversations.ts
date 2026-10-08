"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { releaseToBot } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";

function ownConversation(businessId: string, id: string) {
  return prisma.conversation.findFirst({ where: { id, businessId }, select: { id: true } });
}

/** Hands a paused conversation back to the bot, both on the AI service and here. */
export async function handBackToAi(conversationId: string): Promise<{ ok: boolean }> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false };

  const conversation = await ownConversation(ctx.businessId, conversationId);
  if (!conversation || !(await releaseToBot(ctx.businessId, conversationId))) return { ok: false };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { botPausedUntil: null, aiEnabled: true },
  });
  revalidatePath(DASH.conversations);
  return { ok: true };
}
