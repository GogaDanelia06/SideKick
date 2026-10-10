import { prisma } from "@/lib/db";
import { stripEmoji } from "./emoji";
import { NO_EMOJI } from "./settings";

export async function applyReplyStyle(businessId: string, reply: string): Promise<string> {
  const config = await prisma.aiConfig.findUnique({ where: { businessId }, select: { emoji: true } });
  return config?.emoji === NO_EMOJI ? stripEmoji(reply) : reply;
}
