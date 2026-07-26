import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

const TOKEN_TTL_MINUTES = 60;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true },
  });
  if (!user) return null;

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

export async function verifyResetToken(token: string) {
  if (!token || token.length < 32) return null;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  const a = Buffer.from(record.tokenHash);
  const b = Buffer.from(hash(token));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return record;
}

export async function consumeResetToken(id: string) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function purgeExpiredResetTokens() {
  const { count } = await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}
