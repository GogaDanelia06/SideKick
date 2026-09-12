import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Selected explicitly: these rows reach client components (no password hash). */
const TEAM_USER_FIELDS = { id: true, name: true, email: true } as const;

export type TeamMember = Prisma.MembershipGetPayload<{
  include: { user: { select: typeof TEAM_USER_FIELDS } };
}>;

export function getTeam(businessId: string): Promise<TeamMember[]> {
  return prisma.membership.findMany({
    where: { businessId },
    include: { user: { select: TEAM_USER_FIELDS } },
    orderBy: { createdAt: "asc" },
  });
}
