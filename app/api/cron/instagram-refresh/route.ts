import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshInstagramTokens } from "@/lib/channels/instagramRefresh";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** Vercel Cron sends `Bearer CRON_SECRET`; without a configured secret every call is refused. */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
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
