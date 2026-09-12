"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { releaseToBot } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";
import { deliverOutbound, type DeliveryStatus } from "@/lib/channels/send";
import { markConversationActive } from "@/lib/conversations";
import { DASH } from "@/lib/dashboard/routes";
import { fmtTime } from "@/lib/dashboard/time";

export type ReplyResult =
  | {
      ok: true;
      delivery: DeliveryStatus | null;
      message: { id: string; sender: "OPERATOR"; text: string; stoppedReason: null; timeLabel: string };
    }
  | { ok: false; error: string };

function ownConversation(businessId: string, id: string) {
  return prisma.conversation.findFirst({ where: { id, businessId }, select: { id: true } });
}

export async function setConversationAi(conversationId: string, aiEnabled: boolean) {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return;

  await prisma.conversation.updateMany({
    where: { id: conversationId, businessId: ctx.businessId },
    data: { aiEnabled },
  });
  revalidatePath(DASH.conversations);
}

/** Sends an operator's reply on the customer's channel: stored first, then delivered. */
export async function sendOperatorReply(conversationId: string, text: string): Promise<ReplyResult> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const body = text.trim();
  if (!body) return { ok: false, error: "empty" };

  const conversation = await ownConversation(ctx.businessId, conversationId);
  if (!conversation) return { ok: false, error: "not_found" };

  // Operator replies are not billed against the plan.
  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender: "OPERATOR", text: body },
    select: { id: true },
  });
  await markConversationActive(conversation.id);
  const delivery = await deliverOutbound(conversation.id, message.id, body);

  revalidatePath(DASH.conversations);
  return {
    ok: true,
    delivery: delivery?.status ?? null,
    message: {
      id: message.id,
      sender: "OPERATOR",
      text: body,
      stoppedReason: null,
      timeLabel: fmtTime.format(new Date()),
    },
  };
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
