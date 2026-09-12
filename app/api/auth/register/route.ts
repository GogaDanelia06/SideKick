import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { provisionBusiness } from "@/lib/provision";
import { registerSchema } from "@/lib/validation/auth";
import { clientIp, consume, tooManyRequestsMessage } from "@/lib/security/rateLimit";
import { createVerificationToken } from "@/lib/auth/emailVerification";
import { mailConfigured, sendMail } from "@/lib/mail/send";
import { verifyEmailEmail } from "@/lib/mail/templates";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";

export async function POST(req: Request) {
  const limit = await consume("register", clientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: tooManyRequestsMessage(limit.retryAfterSec) },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { firstName, lastName, email, password, phone, company, field } = parsed.data;
  const normEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normEmail } });
  if (existing) {
    return NextResponse.json({ error: "ეს მეილი უკვე რეგისტრირებულია" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Without a mail provider nobody could verify, so the address is trusted.
  const canSendMail = mailConfigured();

  // User and business are created together, so no account exists without a business.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: normEmail,
        name: `${firstName} ${lastName}`.trim(),
        passwordHash,
        phone,
        emailVerified: canSendMail ? null : new Date(),
      },
    });

    await provisionBusiness(created.id, company || `${firstName}'s business`, field, tx);
    return created;
  });

  if (!canSendMail) return NextResponse.json({ ok: true, verify: false });

  const { token } = await createVerificationToken(user.id);
  const { sent } = await sendMail(
    verifyEmailEmail(user.email, absoluteUrl(`/api/auth/verify?token=${token}`), user.name),
  );

  // If the verification email cannot be sent, activate the account rather than strand it.
  if (!sent) {
    log.error("verification mail failed; activating the account instead", null, {
      userId: user.id,
    });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    return NextResponse.json({ ok: true, verify: false });
  }

  return NextResponse.json({ ok: true, verify: true });
}
