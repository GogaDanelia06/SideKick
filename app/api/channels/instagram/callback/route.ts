import { NextResponse } from "next/server";
import { guardCallback } from "@/lib/channels/oauthCallback";
import { connectInstagramFromCode } from "@/lib/channels/instagramConnect";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";
import { CALLBACK_PATH } from "../start/route";

export const dynamic = "force-dynamic";

/** Back to the channels page, on the request's own origin so local testing stays local. */
const back = (request: Request, status: string) =>
  NextResponse.redirect(
    new URL(`${DASH.channels}?connect=${status}&channel=INSTAGRAM`, request.url),
  );

export async function GET(request: Request) {
  const guard = await guardCallback(request);
  if (!guard.ok) return back(request, guard.status);

  const result = await connectInstagramFromCode(
    guard.businessId,
    guard.code,
    absoluteUrl(CALLBACK_PATH),
  );

  return back(request, result.ok ? "connected" : result.reason);
}
