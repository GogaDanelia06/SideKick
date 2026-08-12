import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordResetEmail } from "@/lib/mail/templates";
import { forgotSchema } from "@/lib/validation/auth";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";
import { clientIp, consume, tooManyRequestsMessage } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  const ipLimit = await consume("forgotIp", clientIp(req));
  if (!ipLimit.ok) return throttled(ipLimit.retryAfterSec);

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const emailLimit = await consume("forgot", parsed.data.email);
  if (!emailLimit.ok) return throttled(emailLimit.retryAfterSec);

  const issued = await createResetToken(parsed.data.email);

  if (!issued) {
    log.info("password reset requested for unknown address");
  }

  if (issued) {
    const link = absoluteUrl(`/reset?token=${issued.token}`);
    const { sent } = await sendMail(passwordResetEmail(issued.user.email, link, issued.user.name));

    // The answer below stays the same either way, so without this line a
    // provider refusing every message looks exactly like success: the token is
    // in the database, the form says "check your inbox", and nothing arrives.
    // That is how a broken sender goes unnoticed for days.
    if (!sent) {
      log.error("password reset email could not be sent", undefined, { to: issued.user.email });
    }
  }

  // Deliberately identical for a known and an unknown address. Anything that
  // differed — wording, status, even timing — would turn this endpoint into a
  // way of asking which email addresses have accounts here.
  return NextResponse.json({ ok: true });
}

function throttled(retryAfterSec: number) {
  return NextResponse.json(
    { error: tooManyRequestsMessage(retryAfterSec) },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
