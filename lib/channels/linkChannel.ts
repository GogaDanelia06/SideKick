import { prisma } from "@/lib/db";
import type { ChannelType } from "@prisma/client";

/**
 * Writes a credential onto the tenant's existing channel row.
 *
 * Shared by both connect flows, and deliberately so: Facebook Login and
 * Instagram Login produce completely different tokens, but what happens to the
 * result is identical, and two copies of this drifted apart once already.
 *
 * Updates rather than creates, because every business is provisioned with a row
 * per channel. Creating a second one would leave the dashboard toggling a
 * different row from the one the webhook reads — which looks exactly like a
 * connection that silently does nothing.
 */
export async function linkChannel(
  businessId: string,
  type: ChannelType,
  externalId: string,
  accessToken: string,
): Promise<void> {
  const existing = await prisma.channel.findFirst({
    where: { businessId, type },
    select: { id: true },
  });

  if (existing) {
    await prisma.channel.update({
      where: { id: existing.id },
      data: { externalId, accessToken, connected: true },
    });
    return;
  }

  await prisma.channel.create({
    data: { businessId, type, externalId, accessToken, connected: true },
  });
}
