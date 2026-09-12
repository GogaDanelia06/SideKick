import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BILLING_STOPS } from "@/lib/billing/limits";
import { fmtTime } from "@/lib/dashboard/time";
import { minutesSince } from "./metrics";

const LIST_LIMIT = 100;
const THREAD_LIMIT = 200;

function identity(customerName: string | null) {
  const name = customerName?.trim() || "—";
  return { name, initials: name.slice(0, 2).toUpperCase() };
}

function isPaused(pausedUntil: Date | null): boolean {
  return Boolean(pausedUntil && pausedUntil > new Date());
}

function alertFor(pausedUntil: Date | null, stoppedReason: string | null | undefined, aiEnabled: boolean) {
  if (isPaused(pausedUntil)) return "wait" as const;
  if (stoppedReason) return BILLING_STOPS.has(stoppedReason) ? ("billing" as const) : ("aierr" as const);
  return aiEnabled ? ("none" as const) : ("aioff" as const);
}

export async function getConversations(businessId: string, channel?: ChannelType) {
  const rows = await prisma.conversation.findMany({
    where: { businessId, ...(channel ? { channel: { type: channel } } : {}) },
    include: {
      channel: { select: { type: true } },
      lead: { select: { id: true } },
      orders: { select: { id: true }, take: 1 },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true, createdAt: true, stoppedReason: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: LIST_LIMIT,
  });

  const now = Date.now();
  return rows.map((c) => {
    const last = c.messages[0];
    return {
      id: c.id,
      ...identity(c.customerName),
      channelType: c.channel?.type ?? null,
      ring: c.orders.length ? ("order" as const) : c.lead ? ("lead" as const) : ("none" as const),
      alert: alertFor(c.botPausedUntil, last?.stoppedReason, c.aiEnabled),
      preview: last?.text ?? "",
      aiEnabled: c.aiEnabled,
      status: c.status,
      minutesAgo: minutesSince(last?.createdAt ?? c.updatedAt, now),
    };
  });
}

export type ConversationRow = Awaited<ReturnType<typeof getConversations>>[number];

export async function getConversation(businessId: string, id: string) {
  const c = await prisma.conversation.findFirst({
    where: { id, businessId },
    include: {
      channel: { select: { type: true } },
      lead: { select: { id: true } },
      orders: { select: { id: true }, take: 1 },
      messages: { orderBy: { createdAt: "asc" }, take: THREAD_LIMIT },
    },
  });
  if (!c) return null;

  return {
    id: c.id,
    ...identity(c.customerName),
    channelType: c.channel?.type ?? null,
    status: c.status,
    aiEnabled: c.aiEnabled,
    handedOver: isPaused(c.botPausedUntil),
    hasLead: Boolean(c.lead),
    hasOrder: c.orders.length > 0,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      stoppedReason: m.stoppedReason,
      // Formatted on the server, in the shop's timezone.
      timeLabel: fmtTime.format(m.createdAt),
    })),
  };
}

export type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversation>>>;
