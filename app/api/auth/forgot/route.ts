import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth/passwordReset";
import { sendMail } from "@/lib/mail/send";
import { passwordResetEmail } from "@/lib/mail/templates";
import { forgotSchema } from "@/lib/validation/auth";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Request a password reset link.
 *
 * Always responds 200 with the same body, whether or not the address exists.
 * Revealing that difference would turn this endpoint into a way to discover
 * which emails have accounts.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const issued = await createResetToken(parsed.data.email);

  if (issued) {
    const link = absoluteUrl(`/reset?token=${issued.token}`);
    await sendMail(passwordResetEmail(issued.user.email, link, issued.user.name));
  }

  return NextResponse.json({ ok: true });
}
