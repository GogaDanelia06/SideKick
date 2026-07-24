import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * Password reset tokens.
 *
 * Security decisions, and why:
 *  - The raw token goes in the emailed link but is NEVER stored. We store a
 *    SHA-256 hash, so a database leak can't be used to reset anyone's password.
 *  - Single use (`usedAt`) and short-lived, so a leaked link has a small window.
 *  - Requesting a new link invalidates any earlier ones for that user.
 *  - Lookup is by hash (indexed, unique), then compared in constant time.
 */

const TOKEN_TTL_MINUTES = 60;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Issue a reset token for an email.
 *
 * Returns `null` when no account matches — the caller must still respond as if
 * it succeeded, so the endpoint can't be used to discover which emails exist.
 */
export async function createResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true },
  });
  if (!user) return null;

  // Any previously issued link stops working the moment a new one is requested.
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hash(token), expiresAt },
  });

  return { token, user, expiresAt };
}

/** Look up a token and confirm it's unused and unexpired. */
export async function verifyResetToken(token: string) {
  if (!token || token.length < 32) return null;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  // Constant-time compare so timing can't be used to probe for valid tokens.
  const a = Buffer.from(record.tokenHash);
  const b = Buffer.from(hash(token));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return record;
}

/** Mark a token spent. Call inside the same transaction as the password write. */
export async function consumeResetToken(id: string) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

/** Housekeeping — safe to call from a cron job later. */
export async function purgeExpiredResetTokens() {
  const { count } = await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}
