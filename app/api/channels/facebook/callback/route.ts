import { NextResponse } from "next/server";
import { guardCallback } from "@/lib/channels/oauthCallback";
import { connectFromCode } from "@/lib/channels/facebookConnect";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { CALLBACK_PATH } from "../start/route";

export const dynamic = "force-dynamic";

/**
 * Back to the channels page with the outcome in the query string.
 *
 * Resolved against the incoming request rather than the configured site URL, so
 * a developer testing this locally lands on their own machine instead of being
 * thrown out to production. The `redirect_uri` handed to Meta stays absolute —
 * that one has to match what is registered, character for character.
 */
const back = (request: Request, status: string) =>
  // `channel` so the message lands under the row it belongs to.
  NextResponse.redirect(
    new URL(`${DASH.channels}?connect=${status}&channel=FACEBOOK`, request.url),
  );

/** Where Meta returns the merchant after they grant access to a Page. */
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

  // Said out loud, because the two outcomes need different next steps from the
  // merchant: one is finished, the other still needs Instagram connecting on
  // its own. A single "Connected" for both sent people away thinking they were
  // done and wondering later why Instagram was quiet.
  return back(request, result.instagram ? "connected" : "connected_no_ig");
}
