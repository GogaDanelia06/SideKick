import type { ChannelType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BILLING_STOPS } from "@/lib/billing/limits";
import { fmtTime } from "../time";

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
    take: 100,
  });

  const now = Date.now();
  return rows.map((c) => {
    const last = c.messages[0];
    const name = c.customerName?.trim() || "—";
    return {
      id: c.id,
      name,
      initials: name.slice(0, 2).toUpperCase(),
      channelType: c.channel?.type ?? null,
      ring: c.orders.length ? ("order" as const) : c.lead ? ("lead" as const) : ("none" as const),
      alert: c.botPausedUntil && c.botPausedUntil > new Date()
        ? ("wait" as const)
        : last?.stoppedReason
          ? BILLING_STOPS.has(last.stoppedReason)
            ? ("billing" as const)
            : ("aierr" as const)
          : !c.aiEnabled
            ? ("aioff" as const)
            : ("none" as const),
      preview: last?.text ?? "",
      aiEnabled: c.aiEnabled,
      status: c.status,
      minutesAgo: Math.max(
        0,
        Math.round((now - (last?.createdAt ?? c.updatedAt).getTime()) / 60000),
      ),
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
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });
  if (!c) return null;

  const name = c.customerName?.trim() || "—";
  return {
    id: c.id,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    channelType: c.channel?.type ?? null,
    status: c.status,
    aiEnabled: c.aiEnabled,
    handedOver: Boolean(c.botPausedUntil && c.botPausedUntil > new Date()),
    hasLead: Boolean(c.lead),
    hasOrder: c.orders.length > 0,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      stoppedReason: m.stoppedReason,
      timeLabel: fmtTime.format(m.createdAt),
    })),
  };
}

export type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversation>>>;
