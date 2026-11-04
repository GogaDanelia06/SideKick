import { NextResponse } from "next/server";
import { refreshInstagramTokens } from "@/lib/channels/instagramRefresh";
import { log } from "@/lib/logger";
import { bearerToken, safeEqual } from "@/lib/security/safeEqual";

export const dynamic = "force-dynamic";

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  return safeEqual(bearerToken(request), secret);
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    if (!process.env.CRON_SECRET) {
      log.warn("instagram token refresh called while CRON_SECRET is unset");
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const report = await refreshInstagramTokens();

  log.info("instagram token refresh ran", report);

  return NextResponse.json(report);
}
