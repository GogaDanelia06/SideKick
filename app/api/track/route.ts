import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics/record";

export const dynamic = "force-dynamic";

type Beacon = { name?: unknown; path?: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Beacon | null;
  const name = typeof body?.name === "string" ? body.name : "";
  const path = typeof body?.path === "string" ? body.path : "";
  if (name) await recordEvent(name, path);

  return new NextResponse(null, { status: 204 });
}
