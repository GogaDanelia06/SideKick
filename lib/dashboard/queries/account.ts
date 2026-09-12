import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Selected explicitly: this row reaches a client component. */
const PROFILE_USER_FIELDS = { id: true, name: true, email: true, phone: true } as const;

export type ProfileUser = Prisma.UserGetPayload<{ select: typeof PROFILE_USER_FIELDS }>;

export async function getAccount(userId: string, businessId: string) {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, isAdmin: true } }),
    prisma.subscription.findUnique({ where: { businessId }, select: { plan: { select: { name: true } } } }),
  ]);

  const name = user?.name?.trim() || user?.email?.split("@")[0] || "—";
  return {
    name,
    email: user?.email ?? "",
    initial: name.charAt(0).toUpperCase(),
    planName: subscription?.plan.name ?? null,
    isAdmin: user?.isAdmin ?? false,
  };
}

export type Account = Awaited<ReturnType<typeof getAccount>>;

export async function getProfile(userId: string, businessId: string) {
  const [user, business] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: PROFILE_USER_FIELDS }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  return { user, business };
}
