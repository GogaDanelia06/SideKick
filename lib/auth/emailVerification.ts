import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

/** Signup confirmation tokens, built like password reset tokens: hashed, single use, 24h. */

const TOKEN_TTL_HOURS = 24;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createVerificationToken(userId: string) {
  // Reissuing invalidates older links.
  await prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60_000);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hash(token), expiresAt },
  });

  return { token, expiresAt };
}

export async function verifyVerificationToken(token: string) {
  if (!token || token.length < 32) return null;

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: { select: { id: true, email: true, emailVerified: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  const a = Buffer.from(record.tokenHash);
  const b = Buffer.from(hash(token));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return record;
}

/** Marks the address verified and consumes the token in one transaction. */
export async function consumeVerificationToken(id: string, userId: string) {
  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } }),
  ]);
}

export async function purgeExpiredVerificationTokens() {
  const { count } = await prisma.emailVerificationToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}
