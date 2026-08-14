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
 * The two `instagram_*` scopes that used to be here are gone. They belong to
 * the Messenger Platform's Instagram, which is not the product this account
 * uses, and asking for them bought nothing except a longer consent screen and
 * more for App Review to approve.
 */
const SCOPES = ["pages_show_list", "pages_messaging", "pages_manage_metadata"].join(",");

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
