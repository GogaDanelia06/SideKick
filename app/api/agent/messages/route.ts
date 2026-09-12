import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  MESSAGE_SENDERS,
  authenticate,
  isDenial,
  oneOf,
  readJson,
  requireStr,
} from "@/lib/agent/auth";
import { ownedConversation } from "@/lib/agent/conversation";
import { checkLimit, countMessage } from "@/lib/billing/limits";
import { deliverOutbound } from "@/lib/channels/send";

export const dynamic = "force-dynamic";

/** Records a customer or AI message; AI messages are billed and delivered to the customer. */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (isDenial(body)) return body.response;

  const auth = await authenticate(request, body.businessId);
  if (isDenial(auth)) return auth.response;

  const conversationId = requireStr(body, "conversationId");
  if (isDenial(conversationId)) return conversationId.response;

  const text = requireStr(body, "text");
  if (isDenial(text)) return text.response;

  const sender = oneOf(body, "sender", MESSAGE_SENDERS);
  if (isDenial(sender)) return sender.response;
  if (!sender) return NextResponse.json({ error: "sender is required" }, { status: 400 });

  const conversation = await ownedConversation(auth.businessId, conversationId);
  if (isDenial(conversation)) return conversation.response;

  // Only AI messages count against the plan; customer messages are always recorded.
  if (sender === "AI") {
    const verdict = await checkLimit(auth.businessId, "messages");
    if (!verdict.allowed) {
      const expired = verdict.reason === "expired";
      return NextResponse.json(
        {
          error: expired ? "subscription_expired" : "message_limit_reached",
          message: expired
            ? `This business's subscription has lapsed and its grace period is over. This reply was not recorded. Customer messages are still accepted — stop generating answers until it is renewed.`
            : `The ${verdict.planName} plan allows ${verdict.limit} AI messages and ${verdict.used} have been used. This reply was not recorded. Customer messages are still accepted — stop generating answers for this business until the plan is upgraded.`,
          limit: verdict.limit,
          used: verdict.used,
        },
        { status: 402 },
      );
    }
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender, text },
    select: { id: true, createdAt: true },
  });

  if (sender === "AI") await countMessage(auth.businessId);

  // Traffic moves NEW to ACTIVE but never reopens a conversation marked DONE.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  // Awaited so the caller sees the delivery outcome; a failed delivery does not
  // fail the request, because the message is already saved.
  const delivery =
    sender === "CUSTOMER" ? null : await deliverOutbound(conversation.id, message.id, text);

  return NextResponse.json({
    messageId: message.id,
    createdAt: message.createdAt,
    delivery: delivery ? { status: delivery.status, detail: delivery.detail } : null,
  });
}

const HISTORY_LIMIT = 100;

/** The latest messages of a conversation, oldest first. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const conversationId = url.searchParams.get("conversationId");

  const auth = await authenticate(request, businessId);
  if (isDenial(auth)) return auth.response;

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  // Another business's conversation reads as not found.
  const owned = await ownedConversation(auth.businessId, conversationId);
  if (isDenial(owned)) return owned.response;

  const limit = Math.min(HISTORY_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || HISTORY_LIMIT));

  const rows = await prisma.message.findMany({
    where: { conversationId: owned.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, sender: true, text: true, createdAt: true, stoppedReason: true },
  });

  return NextResponse.json({
    conversationId: owned.id,
    messages: rows.reverse().map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      at: m.createdAt.toISOString(),
      stoppedReason: m.stoppedReason,
    })),
  });
}
