import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { resetSchema } from "@/lib/validation/auth";
import { log } from "@/lib/logger";
import { clientIp, consume } from "@/lib/security/rateLimit";
import { authError, invalidInput, throttled } from "@/lib/auth/apiError";
import { AUTH_MESSAGES } from "@/lib/auth/messages";

export async function POST(req: Request) {
  const limit = await consume("reset", clientIp(req));
  if (!limit.ok) return throttled(limit.retryAfterSec);

  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return invalidInput(parsed.error);

  const record = await verifyResetToken(parsed.data.token);
  if (!record) return authError(AUTH_MESSAGES.linkInvalid, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  log.info("password reset completed", { userId: record.userId });
  await sendMail(passwordChangedEmail(record.user.email));
  return NextResponse.json({ ok: true });
}
