import { NextResponse } from "next/server";
import {
  consumeVerificationToken,
  verifyVerificationToken,
} from "@/lib/auth/emailVerification";
import { absoluteUrl } from "@/lib/seo/site";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** The signup email's confirmation link; every outcome redirects to the login page. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  const record = await verifyVerificationToken(token);
  if (!record) {
    return NextResponse.redirect(absoluteUrl("/login?verify=invalid"));
  }

  // A second click still counts as success.
  if (record.user.emailVerified) {
    return NextResponse.redirect(absoluteUrl("/login?verify=already"));
  }

  await consumeVerificationToken(record.id, record.user.id);
  log.info("email verified", { userId: record.user.id });

  return NextResponse.redirect(absoluteUrl("/login?verify=ok"));
}
