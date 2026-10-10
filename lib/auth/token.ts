import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

export async function stampSignIn(token: JWT, user: { id: string; remember?: boolean }): Promise<JWT> {
  token.uid = user.id;
  token.remember = user.remember === true;
  token.startedAt = Date.now();

  const [first, account] = await Promise.all([
    prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { isAdmin: true } }),
  ]);
  if (first) {
    token.businessId = first.businessId;
    token.role = first.role;
  }
  token.isAdmin = account?.isAdmin ?? false;
  return token;
}

export async function switchTokenBusiness(token: JWT, businessId: unknown): Promise<JWT> {
  if (typeof businessId !== "string" || !token.uid) return token;

  try {
    const membership = await prisma.membership.findUnique({
      where: { userId_businessId: { userId: token.uid, businessId } },
      select: { role: true },
    });
    if (membership) {
      token.businessId = businessId;
      token.role = membership.role;
    }
  } catch (err) {
    log.error("could not check the membership for a business switch", err, { userId: token.uid });
  }
  return token;
}
