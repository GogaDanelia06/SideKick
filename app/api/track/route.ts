import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics/record";

export const dynamic = "force-dynamic";

/**
 * Where the browser reports an event.
 *
 * Public by necessity — it counts visitors, most of whom are not signed in. It
 * is written to be dull to abuse: only names from the closed list are accepted,
 * nothing about the caller is stored, and the reply is always 204 so a probe
 * learns nothing about which names exist.
 *
 * The worst an attacker achieves is inflating a counter, which is true of any
 * web analytics and is why these figures are a trend indicator, not an audit.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: unknown; path?: unknown };
    const name = typeof body.name === "string" ? body.name : "";
    const path = typeof body.path === "string" ? body.path : "";
    if (name) await recordEvent(name, path);
  } catch {
    // Malformed body — nothing to count, nothing to report.
  }

  return new NextResponse(null, { status: 204 });
}
