import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * Signup confirmation tokens.
 *
 * Deliberately the same shape as `passwordReset.ts` — hashed at rest, single
 * use, superseded on reissue — because these are the same kind of secret and
 * two different designs would mean two chances to get one wrong.
 *
 * The window is a day rather than an hour: a password reset is something you
 * asked for and are waiting on, while a signup confirmation often sits until
 * the next time someone opens their mail.
 */

const TOKEN_TTL_HOURS = 24;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createVerificationToken(userId: string) {
  // Reissuing invalidates the last one, so a forwarded old mail cannot be used
  // after the person has asked for a fresh link.
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

/**
 * Marks the address confirmed and burns the token, together.
 *
 * One transaction because a half-applied confirmation is the worst outcome:
 * either a spent token on an unverified account, or a verified account with a
 * link still live in someone's inbox.
 */
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
