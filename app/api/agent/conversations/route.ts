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

/** Gets or creates the conversation for a customer; idempotent by `customerRef`. */
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

  // An optional channel must belong to this business.
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
    // Only fills gaps: a name typed in the dashboard is never overwritten.
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
    aiEnabled: conversation.aiEnabled && !isPaused(conversation.botPausedUntil),
  });
}

function isPaused(until: Date | null): boolean {
  return until !== null && until.getTime() > Date.now();
}
