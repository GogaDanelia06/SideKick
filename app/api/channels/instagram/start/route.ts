import { NextResponse } from "next/server";
import { requireContext } from "@/lib/session";
import { issueState } from "@/lib/channels/oauthState";
import { authorizeUrl } from "@/lib/channels/instagramLogin";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";

export const dynamic = "force-dynamic";

/**
 * Where the merchant is sent to grant us access to their Instagram account.
 *
 * This is **Instagram Login**, not Facebook Login, and the difference is the
 * whole point of this route existing separately. It authorises the Instagram
 * professional account directly, on instagram.com, with the Instagram app's own
 * client id — see lib/channels/instagramLogin.ts for why the two cannot be
 * merged back together.
 *
 * The redirect URI below must be registered under the app's Instagram product
 * settings. It is a different list from Facebook Login's, and a URI missing
 * from it fails on Meta's screen before the merchant ever reaches consent.
 */
export const CALLBACK_PATH = "/api/channels/instagram/callback";

export async function GET() {
  // Redirects to /login on its own when there is no session, which is the right
  // answer: the whole point of this route is to act for a known business.
  const ctx = await requireContext();

  // The Instagram app id, not META_APP_ID. Passing the Facebook app's id here
  // fails with an error about an invalid client, which reads like a typo and is
  // in fact the wrong application entirely.
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) {
    return NextResponse.redirect(
      absoluteUrl(`${DASH.channels}?connect=unconfigured_ig&channel=INSTAGRAM`),
    );
  }

  return NextResponse.redirect(
    authorizeUrl(appId, absoluteUrl(CALLBACK_PATH), issueState(ctx.businessId)),
  );
}
