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
    await sendMail(passwordResetEmail(issued.user.email, link, issued.user.name));
  }

  return NextResponse.json({ ok: true });
}

function throttled(retryAfterSec: number) {
  return NextResponse.json(
    { error: tooManyRequestsMessage(retryAfterSec) },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
