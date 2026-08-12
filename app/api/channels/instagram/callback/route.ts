import { NextResponse } from "next/server";
import { getContext } from "@/lib/session";
import { readState } from "@/lib/channels/oauthState";
import { connectFromCode } from "@/lib/channels/instagramConnect";
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
  // `channel` so the message lands under the row it belongs to. This flow is
  // Facebook Login; Instagram here authorises separately and will carry its own.
  NextResponse.redirect(
    new URL(`${DASH.channels}?connect=${status}&channel=FACEBOOK`, request.url),
  );

/**
 * Where Meta returns the merchant after they grant access.
 *
 * Three separate things have to agree before a credential is stored, and the
 * reason is worth stating plainly: whoever controls this callback controls
 * which Instagram account a business answers for. Get it wrong and one tenant's
 * customers can be routed into another tenant's inbox.
 *
 *   1. There is a signed-in session — so we know who is asking.
 *   2. The `state` carries our own signature and has not expired.
 *   3. The business inside that state is the business now signed in.
 *
 * Any one of the three alone is bypassable; together they are not.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  // The merchant pressed cancel, or Meta refused. Not an error worth alarming
  // anyone about — they simply did not finish.
  if (params.get("error")) return back(request, "cancelled");

  const ctx = await getContext();
  if (!ctx) return back(request, "signed_out");

  const state = readState(params.get("state"));
  if (!state) {
    log.warn("instagram connect callback arrived with a bad or expired state");
    return back(request, "bad_state");
  }

  if (state.businessId !== ctx.businessId) {
    // The link was started for one business and finished by another. Either a
    // stale tab or somebody being walked into it; refused the same way.
    log.warn("instagram connect state did not match the signed-in business");
    return back(request, "bad_state");
  }

  const code = params.get("code");
  if (!code) return back(request, "bad_state");

  const result = await connectFromCode(ctx.businessId, code, absoluteUrl(CALLBACK_PATH));
  if (!result.ok) return back(request, result.reason);

  log.info("channels connected from Meta", {
    businessId: ctx.businessId,
    instagram: result.instagram,
  });

  return back(request, result.instagram ? "connected" : "connected_no_ig");
}
