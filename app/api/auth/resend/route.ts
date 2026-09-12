import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVerificationToken } from "@/lib/auth/emailVerification";
import { sendMail } from "@/lib/mail/send";
import { verifyEmailEmail } from "@/lib/mail/templates";
import { forgotSchema } from "@/lib/validation/auth";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";
import { clientIp, consume, tooManyRequestsMessage } from "@/lib/security/rateLimit";

/** Resends the signup confirmation link. The answer is identical for every address. */
export async function POST(req: Request) {
  const ipLimit = await consume("resendIp", clientIp(req));
  if (!ipLimit.ok) return throttled(ipLimit.retryAfterSec);

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();

  const emailLimit = await consume("resend", email);
  if (!emailLimit.ok) return throttled(emailLimit.retryAfterSec);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const { token } = await createVerificationToken(user.id);
    const { sent } = await sendMail(
      verifyEmailEmail(user.email, absoluteUrl(`/api/auth/verify?token=${token}`), user.name),
    );

    if (!sent) {
      log.error("verification email could not be re-sent", undefined, { to: user.email });
    }
  }

  return NextResponse.json({ ok: true });
}

function throttled(retryAfterSec: number) {
  return NextResponse.json(
    { error: tooManyRequestsMessage(retryAfterSec) },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
