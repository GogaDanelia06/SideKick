import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics/record";

export const dynamic = "force-dynamic";

/** Public analytics beacon: known event names only, nothing stored about the caller, always 204. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: unknown; path?: unknown };
    const name = typeof body.name === "string" ? body.name : "";
    const path = typeof body.path === "string" ? body.path : "";
    if (name) await recordEvent(name, path);
  } catch {}

  return new NextResponse(null, { status: 204 });
}
