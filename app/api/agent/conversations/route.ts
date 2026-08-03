import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import {
  CHANNEL_TYPES,
  authenticate,
  isDenial,
  notFound,
  oneOf,
  readJson,
  requireStr,
  str,
} from "@/lib/agent/auth";

export const dynamic = "force-dynamic";

/**
 * Gets — or creates — the conversation for one customer.
 *
 * This exists because orders and leads point at a conversation, so the AI
 * service needs one to exist before it can record anything. Rather than teach
 * it our id format, our status enum and our defaults, it names the customer and
 * we hand back an id.
 *
 * Idempotent by `customerRef`: calling it twice for the same customer returns
 * the same conversation. That matters because a retry after a timeout is the
 * normal case for a service like this, and the alternative is a duplicate chat
 * in the tenant's inbox every time the network hiccups.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (isDenial(body)) return body.response;

  const auth = await authenticate(request, body.businessId);
  if (isDenial(auth)) return auth.response;

  const customerRef = requireStr(body, "customerRef");
  if (isDenial(customerRef)) return customerRef.response;

  const customerName = str(body, "customerName");
  const channelType = oneOf(body, "channelType", CHANNEL_TYPES);
  if (isDenial(channelType)) return channelType.response;

  // A channel is optional, but a named one must be this tenant's — otherwise a
  // typo would silently file the chat under someone else's channel.
  let channelId: string | undefined;
  if (channelType) {
    const channel = await prisma.channel.findUnique({
      where: { businessId_type: { businessId: auth.businessId, type: channelType } },
      select: { id: true },
    });
    if (!channel) return notFound(`no ${channelType} channel for this business`).response;
    channelId = channel.id;
  }

  const conversation = await prisma.conversation.upsert({
    where: { businessId_customerRef: { businessId: auth.businessId, customerRef } },
    create: {
      businessId: auth.businessId,
      customerRef,
      customerName,
      channelId,
    },
    // Only fills gaps. A name a human typed in the dashboard outranks whatever
    // the platform reports, so it is never overwritten here.
    update: {
      ...(customerName ? { customerName: customerName } : {}),
      ...(channelId ? { channelId } : {}),
    },
    select: { id: true, status: true, aiEnabled: true, botPausedUntil: true, createdAt: true },
  });

  log.info("agent resolved a conversation", {
    businessId: auth.businessId,
    conversationId: conversation.id,
  });

  return NextResponse.json({
    conversationId: conversation.id,
    status: conversation.status,
    // The AI service needs to know when to stay quiet: a tenant can pause the
    // bot on a chat to answer it themselves.
    aiEnabled: conversation.aiEnabled && !isPaused(conversation.botPausedUntil),
  });
}

function isPaused(until: Date | null): boolean {
  return until !== null && until.getTime() > Date.now();
}
