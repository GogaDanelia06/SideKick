import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { resetSchema } from "@/lib/validation/auth";

/** Set a new password using a valid reset token. */
export async function POST(req: Request) {
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

  // Password write and token spend happen together — if either fails, neither
  // applies, so a token can't be burned without the password actually changing.
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await sendMail(passwordChangedEmail(record.user.email));
  return NextResponse.json({ ok: true });
}
