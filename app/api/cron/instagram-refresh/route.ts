import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshInstagramTokens } from "@/lib/channels/instagramRefresh";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Renews Instagram tokens before they lapse. Runs daily — see vercel.json.
 *
 * Public URLs get probed, and this one does real work against Meta, so it is
 * closed by a secret rather than left open. Vercel sends `CRON_SECRET` as a
 * bearer token on its own invocations; with none configured the endpoint
 * refuses everything rather than defaulting to open, because an unauthenticated
 * job anyone can trigger is worse than a job that does not run.
 */
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

  // Logged even when it did nothing. A job whose only trace is failure looks
  // identical to a job that never ran, and this one is invisible for weeks at
  // a time between tokens coming due.
  log.info("instagram token refresh ran", report);

  return NextResponse.json(report);
}
