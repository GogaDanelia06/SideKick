import { prisma } from "@/lib/db";
import { isActivated } from "./activation";

export async function businessActivated(businessId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({ where: { businessId }, select: { status: true, renewsAt: true } });
  return isActivated(subscription);
}
