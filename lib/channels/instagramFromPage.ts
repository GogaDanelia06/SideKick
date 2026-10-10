import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { linkChannel } from "./linkChannel";
import type { Page } from "./connectGraph";

export async function linkInstagramFromPage(businessId: string, page: Page): Promise<boolean> {
  const igId = page.instagram_business_account?.id;
  if (!igId || !page.access_token) return false;

  const existing = await prisma.channel.findFirst({
    where: { businessId, type: "INSTAGRAM" },
    select: { externalId: true, accessToken: true },
  });
  if (existing?.accessToken?.startsWith("IGA") && existing.externalId === igId) {
    log.info("Instagram already holds an Instagram Login token for this account", {
      businessId,
      accountId: igId,
    });
    return true;
  }

  if (existing?.externalId && existing.externalId !== igId) {
    log.warn("replacing the Instagram account on this channel", {
      businessId,
      was: existing.externalId,
      now: igId,
    });
  }

  const linked = await linkChannel(businessId, "INSTAGRAM", igId, page.access_token);
  if (!linked.ok) {
    log.warn("could not carry the Page's Instagram account across", {
      businessId,
      reason: linked.reason,
    });
    return false;
  }

  log.info("Instagram linked through the Facebook Page", { businessId, accountId: igId });
  return true;
}
