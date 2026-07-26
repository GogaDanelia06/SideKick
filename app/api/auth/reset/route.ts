import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { resetSchema } from "@/lib/validation/auth";
import { log } from "@/lib/logger";
import { clientIp, consume, tooManyRequestsMessage } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  const limit = await consume("reset", clientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: tooManyRequestsMessage(limit.retryAfterSec) },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const record = await verifyResetToken(parsed.data.token);
  if (!record) {
    return NextResponse.json(
      { error: "ბმული არასწორია ან ვადა გაუვიდა. მოითხოვეთ ახალი." },
      { status: 400 },
    );
  }

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
