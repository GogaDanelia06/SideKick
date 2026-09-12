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

  // Said plainly rather than hidden behind "if this address is registered".
  //
  // The vague answer is the textbook defence against account enumeration, but
  // here it defended nothing: /api/auth/register already answers 409 "this
  // email is already registered" to anyone who asks. Hiding the same fact on
  // this page only cost real customers — someone who mistyped their address, or
  // signed up with a different one, waited for a mail that was never coming.
  //
  // What still limits probing is the rate limiter above, which runs before the
  // lookup: 3 attempts per address and 10 per IP an hour.
  if (!issued) {
    log.info("password reset requested for unknown address");
    return NextResponse.json(
      {
        error: "ეს მეილი არ არის დარეგისტრირებული",
        code: "not_registered",
      },
      { status: 404 },
    );
  }

  const link = absoluteUrl(`/reset?token=${issued.token}`);
  const { sent } = await sendMail(passwordResetEmail(issued.user.email, link, issued.user.name));

  // Without this line a provider refusing every message looks exactly like
  // success: the token is in the database, the form says "check your inbox", and
  // nothing arrives. That is how a broken sender goes unnoticed for days.
  if (!sent) {
    log.error("password reset email could not be sent", undefined, { to: issued.user.email });
  }

  // A refused send still answers ok. The account exists and a link was issued;
  // a provider outage is ours to find in the logs, not the customer's to debug.
  return NextResponse.json({ ok: true });
}

function throttled(retryAfterSec: number) {
  return NextResponse.json(
    { error: tooManyRequestsMessage(retryAfterSec) },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
