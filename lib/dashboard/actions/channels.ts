"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";

export type ChannelToggleResult =
  | { ok: true }
  | { ok: false; error: "forbidden" }
  | { ok: false; error: "limit"; limit: number; used: number; planName: string };

/** Toggles a channel; says why when the plan's channel cap refuses. */
export async function setChannelConnected(channelId: string, connected: boolean): Promise<ChannelToggleResult> {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  // Only connecting is capped, so a business can always get back under its limit.
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
