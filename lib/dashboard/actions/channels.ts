"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit, type LimitRefusal } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";

export type ChannelToggleResult =
  | { ok: true }
  | { ok: false; error: "forbidden" }
  | ({ ok: false; error: "limit" } & Pick<LimitRefusal, "limit" | "used" | "planName">);

export async function setChannelConnected(channelId: string, connected: boolean): Promise<ChannelToggleResult> {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  if (connected) {
    const verdict = await checkLimit(ctx.businessId, "channels");
    if (!verdict.allowed) {
      const { limit, used, planName } = verdict;
      return { ok: false, error: "limit", limit, used, planName };
    }
  }

  await prisma.channel.updateMany({
    where: { id: channelId, businessId: ctx.businessId },
    data: { connected, status: connected ? "ACTIVE" : "OFF", lastSyncAt: connected ? new Date() : null },
  });
  revalidatePath(DASH.channels);
  return { ok: true };
}

export async function disconnectChannel(channelId: string): Promise<{ ok: true } | { ok: false; error: "forbidden" }> {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await prisma.channel.updateMany({
    where: { id: channelId, businessId: ctx.businessId },
    data: { connected: false, status: "OFF", externalId: null, accessToken: null, tokenExpiresAt: null, lastSyncAt: null },
  });
  revalidatePath(DASH.channels);
  return { ok: true };
}
