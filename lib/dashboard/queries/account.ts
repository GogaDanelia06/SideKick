import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { planLabel } from "@/lib/content/packages";
import { initialOf } from "@/lib/i18n/initial";

/** Selected explicitly: this row reaches a client component. */
const PROFILE_USER_FIELDS = { id: true, name: true, email: true, phone: true } as const;

export type ProfileUser = Prisma.UserGetPayload<{ select: typeof PROFILE_USER_FIELDS }>;

export async function getAccount(userId: string, businessId: string) {
  const [user, subscription, memberships] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, isAdmin: true } }),
    prisma.subscription.findUnique({ where: { businessId }, select: { plan: { select: { name: true, nameEn: true } } } }),
    // Oldest first, like sign-in, which opens the first one.
    prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { role: true, business: { select: { id: true, name: true } } },
    }),
  ]);

  const name = user?.name?.trim() || user?.email?.split("@")[0] || "—";
  return {
    name,
    email: user?.email ?? "",
    initial: initialOf(name),
    planName: subscription ? planLabel(subscription.plan) : null,
    isAdmin: user?.isAdmin ?? false,
    /** The business this session is working in, and every one the user can switch to. */
    businessId,
    businesses: memberships.map(({ role, business }) => ({ id: business.id, name: business.name, role })),
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
