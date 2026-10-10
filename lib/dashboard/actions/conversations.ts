"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { releaseToBot } from "@/lib/ai/client";
import { requirePermission } from "@/lib/auth/permissions";
import { deliverOutbound, type DeliveryStatus } from "@/lib/channels/send";
import { DASH } from "@/lib/dashboard/routes";
import { fmtTime } from "../time";

function ownConversation(businessId: string, id: string) {
  return prisma.conversation.findFirst({ where: { id, businessId }, select: { id: true } });
}

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

export type ReplyResult =
  | {
      ok: true;
      delivery: DeliveryStatus | null;
      message: {
        id: string;
        sender: "OPERATOR";
        text: string;
        stoppedReason: null;
        timeLabel: string;
      };
    }
  | { ok: false; error: string };

export async function sendOperatorReply(
  conversationId: string,
  text: string,
): Promise<ReplyResult> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const body = text.trim();
  if (!body) return { ok: false, error: "empty" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!conversation) return { ok: false, error: "not_found" };

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender: "OPERATOR", text: body },
    select: { id: true },
  });

  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  const delivery = await deliverOutbound(conversation.id, message.id, body);

  revalidatePath(DASH.conversations);
  return {
    ok: true,
    delivery: delivery?.status ?? null,
    message: {
      id: message.id,
      sender: "OPERATOR" as const,
      text: body,
      stoppedReason: null,
      timeLabel: fmtTime.format(new Date()),
    },
  };
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
