import { NextResponse } from "next/server";
import { guardCallback } from "@/lib/channels/oauthCallback";
import { connectFromCode } from "@/lib/channels/facebookConnect";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { CALLBACK_PATH } from "../start/route";

export const dynamic = "force-dynamic";

/** Back to the channels page, on the request's own origin so local testing stays local. */
const back = (request: Request, status: string) =>
  NextResponse.redirect(
    new URL(`${DASH.channels}?connect=${status}&channel=FACEBOOK`, request.url),
  );

export async function GET(request: Request) {
  const guard = await guardCallback(request);
  if (!guard.ok) return back(request, guard.status);

  const result = await connectFromCode(
    guard.businessId,
    guard.code,
    absoluteUrl(CALLBACK_PATH),
  );
  if (!result.ok) return back(request, result.reason);

  log.info("Facebook page connected", {
    businessId: guard.businessId,
    instagram: result.instagram,
  });

  return back(request, result.instagram ? "connected" : "connected_no_ig");
}
