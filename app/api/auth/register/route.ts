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

  // With no mail provider configured, an unverified account is one nobody can
  // ever activate — so the address is trusted instead. Verification is a
  // safeguard, not a reason to hand someone a door with no key.
  const canSendMail = mailConfigured();

  const user = await prisma.user.create({
    data: {
      email: normEmail,
      name: `${firstName} ${lastName}`.trim(),
      passwordHash,
      phone,
      emailVerified: canSendMail ? null : new Date(),
    },
  });

  await provisionBusiness(user.id, company || `${firstName}'s business`, field);

  if (!canSendMail) return NextResponse.json({ ok: true, verify: false });

  const { token } = await createVerificationToken(user.id);
  const { sent } = await sendMail(
    verifyEmailEmail(user.email, absoluteUrl(`/api/auth/verify?token=${token}`), user.name),
  );

  // The provider accepted the signup but refused the mail — a verified sender
  // domain usually. Activating beats stranding someone mid-signup, and the log
  // is where whoever configured it finds out.
  if (!sent) {
    log.error("verification mail failed; activating the account instead", null, {
      userId: user.id,
    });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    return NextResponse.json({ ok: true, verify: false });
  }

  return NextResponse.json({ ok: true, verify: true });
}
