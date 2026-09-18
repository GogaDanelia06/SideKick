import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

/** Stamped once at sign-in: who it is, since when, and which of their businesses opens first. */
export async function stampSignIn(token: JWT, user: { id: string; remember?: boolean }): Promise<JWT> {
  token.uid = user.id;
  // See lib/auth/sessionExpiry.ts. OAuth sign-ins are never remembered.
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

/**
 * Moves the session to another of the user's businesses. The request comes from the
 * browser, so it only takes effect for a business the user is a member of.
 */
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
    // Auth.js signs the user out when this callback throws; a failed switch should not.
    log.error("could not check the membership for a business switch", err, { userId: token.uid });
  }
  return token;
}
