import { NextResponse } from "next/server";
import { requireContext } from "@/lib/session";
import { issueState } from "@/lib/channels/oauthState";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";

export const dynamic = "force-dynamic";

/**
 * Where the merchant is sent to grant us access to their Facebook Page.
 *
 * Deliberately not under `/api/auth/` — NextAuth's catch-all lives there and
 * swallows anything it does not recognise, answering 400 to a route that looks
 * present in the codebase. That cost us an afternoon once already.
 *
 * This used to live under `/api/channels/instagram/` and connect both surfaces
 * at once. It does not any more: Instagram runs on Instagram Login, which is a
 * separate authorisation with separate credentials, and the shared path made
 * two unrelated flows look like one. The Facebook Login redirect URI registered
 * with Meta has to match the new path.
 */
export const CALLBACK_PATH = "/api/channels/facebook/callback";

/**
 * The permissions asked for, and why each one is needed:
 *
 * - `pages_show_list`       — to find which Page to connect at all
 * - `pages_messaging`       — to send replies on Messenger
 * - `pages_manage_metadata` — to subscribe the Page to our webhook
 *
 * The `instagram_*` and `business_management` scopes are here for a second
 * reason, and it is worth writing down because it looks redundant next to
 * instagramConnect.ts.
 *
 * Instagram messages reach an app by one of two roads. Instagram Login is the
 * one this codebase authorises on, and Meta will not deliver its webhooks to an
 * unpublished app — it says so, in as many words, in the Configure webhooks
 * panel. The older road runs the same messages through the Messenger Platform,
 * attached to the Page the account is linked to, and *that* road delivers in
 * development mode: this app receives Facebook messages today, unpublished.
 *
 * So the Page is asked for Instagram message access as well. Nothing else
 * changes: a delivery arriving by either road carries the same
 * `entry.id` — the Instagram account id already stored on the channel — so it
 * routes to the same tenant, and replies still go out on the Instagram Login
 * token. It costs one longer consent screen and may buy months of testing
 * before business verification and App Review come through.
 */
const SCOPES = [
  "pages_show_list",
  "pages_messaging",
  "pages_manage_metadata",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_messages",
  "business_management",
].join(",");

export async function GET() {
  // Redirects to /login on its own when there is no session, which is the right
  // answer: the whole point of this route is to act for a known business.
  const ctx = await requireContext();

  const appId = process.env.META_APP_ID;
  if (!appId) {
    return NextResponse.redirect(
      absoluteUrl(`${DASH.channels}?connect=unconfigured&channel=FACEBOOK`),
    );
  }

  const url = new URL(
    `https://www.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}/dialog/oauth`,
  );
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", absoluteUrl(CALLBACK_PATH));
  url.searchParams.set("state", issueState(ctx.businessId));
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
