import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVerificationToken } from "@/lib/auth/emailVerification";
import { sendMail } from "@/lib/mail/send";
import { verifyEmailEmail } from "@/lib/mail/templates";
import { forgotSchema } from "@/lib/validation/auth";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";
import { clientIp, consume, tooManyRequestsMessage } from "@/lib/security/rateLimit";

/**
 * Sends the signup confirmation link again.
 *
 * Without this, one lost mail locks someone out permanently: they cannot sign
 * in until the address is confirmed, and nothing but registration ever issued a
 * link. Spam folders and mistyped forwarding rules make that a certainty at
 * scale, not an edge case.
 *
 * Modelled on `/api/auth/forgot` down to the reply, and for the same reason —
 * a stranger must not learn from this endpoint which addresses have accounts,
 * nor which of them are still unconfirmed. So an unknown address, a confirmed
 * one, and a genuine resend are answered identically.
 */
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

  // Already confirmed is silence rather than an error. Saying "that account is
  // active" would answer a question the asker has no business asking, and the
  // person who genuinely forgot can just sign in.
  if (user && !user.emailVerified) {
    const { token } = await createVerificationToken(user.id);
    const { sent } = await sendMail(
      verifyEmailEmail(user.email, absoluteUrl(`/api/auth/verify?token=${token}`), user.name),
    );

    // The reply is the same either way, so this line is the only place a
    // provider refusing every message becomes visible.
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
