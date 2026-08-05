import { NextResponse } from "next/server";
import {
  consumeVerificationToken,
  verifyVerificationToken,
} from "@/lib/auth/emailVerification";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * The link in the confirmation email.
 *
 * A GET that redirects rather than an API returning JSON, because the only
 * thing that ever calls it is a person clicking in their mail client. Every
 * outcome lands on the login page with a short reason, so nobody is left
 * looking at a bare error object.
 *
 * Failures are deliberately vague — expired, already used, and never existed
 * all read the same. A precise answer would let someone probe which tokens are
 * real, and none of the three change what the person should do next: ask for a
 * new link.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  const record = await verifyVerificationToken(token);
  if (!record) {
    return NextResponse.redirect(absoluteUrl("/login?verify=invalid"));
  }

  // Clicking a second time is a success, not an error — people forward these
  // to themselves and click twice.
  if (record.user.emailVerified) {
    return NextResponse.redirect(absoluteUrl("/login?verify=already"));
  }

  await consumeVerificationToken(record.id, record.user.id);
  log.info("email verified", { userId: record.user.id });

  return NextResponse.redirect(absoluteUrl("/login?verify=ok"));
}
