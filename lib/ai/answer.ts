import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { askAi, aiConfigured } from "./client";
import { ensurePrompt } from "./ensurePrompt";
import { applyReplyStyle } from "./replyStyle";
import { deliverOutbound } from "@/lib/channels/send";
import { checkLimit, countMessage } from "@/lib/billing/limits";

const HANDOFF_HOURS = 24;

export async function answerCustomer(
  businessId: string,
  conversationId: string,
  text: string,
): Promise<void> {
  if (!aiConfigured()) {
    log.info("AI reply skipped — AI_SERVICE_URL/KEY not set", { conversationId });
    return;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { aiEnabled: true, botPausedUntil: true },
  });
  if (!conversation) return;

  if (!conversation.aiEnabled) return;
  if (conversation.botPausedUntil && conversation.botPausedUntil > new Date()) return;

  const verdict = await checkLimit(businessId, "messages");
  if (!verdict.allowed) {
    const expired = verdict.reason === "expired";
    log.warn(
      expired
        ? "AI reply withheld — the subscription has lapsed past its grace period"
        : "AI reply withheld — the plan's message limit is spent",
      { businessId, conversationId, used: verdict.used, limit: verdict.limit },
    );
    await markLastMessage(conversationId, expired ? "subscription_expired" : "limit_reached");
    return;
  }

  await ensurePrompt(businessId).catch((err) =>
    log.error("could not give the business a prompt to start from", err, { businessId }),
  );

  const answer = await askAi(businessId, conversationId, text);
  const reply = answer && (await applyReplyStyle(businessId, answer.reply));

  if (!answer || !reply) {
    await markLastMessage(conversationId, "ai_error");
    return;
  }

  const message = await prisma.message.create({
    data: { conversationId, sender: "AI", text: reply },
    select: { id: true },
  });

  await countMessage(businessId);

  await deliverOutbound(conversationId, message.id, reply);

  if (answer.handoffRequested) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { botPausedUntil: new Date(Date.now() + HANDOFF_HOURS * 60 * 60_000) },
    });
    await prisma.message.update({
      where: { id: message.id },
      data: { stoppedReason: answer.handoffReason ?? "handoff" },
    });
    log.info("AI handed a conversation to a person", {
      conversationId,
      reason: answer.handoffReason,
    });
  }
}

async function markLastMessage(conversationId: string, reason: string): Promise<void> {
  const last = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (last) {
    await prisma.message.update({ where: { id: last.id }, data: { stoppedReason: reason } });
  }
}
