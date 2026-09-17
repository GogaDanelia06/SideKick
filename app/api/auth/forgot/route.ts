import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordResetEmail } from "@/lib/mail/templates";
import { forgotSchema } from "@/lib/validation/auth";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";
import { clientIp, consume } from "@/lib/security/rateLimit";
import { authError, invalidInput, throttled } from "@/lib/auth/apiError";
import { AUTH_MESSAGES } from "@/lib/auth/messages";

export async function POST(req: Request) {
  const ipLimit = await consume("forgotIp", clientIp(req));
  if (!ipLimit.ok) return throttled(ipLimit.retryAfterSec);

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) return invalidInput(parsed.error);

  const emailLimit = await consume("forgot", parsed.data.email);
  if (!emailLimit.ok) return throttled(emailLimit.retryAfterSec);

  const issued = await createResetToken(parsed.data.email);

  // Unregistered addresses are told so: /api/auth/register already reveals it, and
  // the rate limits above run before this lookup.
  if (!issued) {
    log.info("password reset requested for unknown address");
    return authError(AUTH_MESSAGES.emailUnknown, { status: 404, code: "not_registered" });
  }

  const link = absoluteUrl(`/reset?token=${issued.token}`);
  const { sent } = await sendMail(passwordResetEmail(issued.user.email, link, issued.user.name));

  if (!sent) {
    log.error("password reset email could not be sent", undefined, { to: issued.user.email });
  }

  return NextResponse.json({ ok: true });
}
