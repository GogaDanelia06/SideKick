import { NextResponse } from "next/server";
import { requireContext } from "@/lib/session";
import { issueState } from "@/lib/channels/oauthState";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";

export const dynamic = "force-dynamic";

/**
 * Where the merchant is sent to grant us access to their Page and Instagram.
 *
 * Deliberately not under `/api/auth/` — NextAuth's catch-all lives there and
 * swallows anything it does not recognise, answering 400 to a route that looks
 * present in the codebase. That cost us an afternoon once already.
 */
export const CALLBACK_PATH = "/api/channels/instagram/callback";

/**
 * The permissions asked for, and why each one is needed:
 *
 * - `pages_show_list`         — to find which Page to connect at all
 * - `pages_messaging`         — to send replies on Messenger
 * - `pages_manage_metadata`   — to subscribe the Page to our webhook
 * - `instagram_basic`         — to resolve the Page's Instagram account id
 * - `instagram_manage_messages` — to read and send Instagram messages
 *
 * Nothing beyond these. Every extra scope is another thing App Review has to
 * approve and another thing a merchant has to be persuaded to hand over.
 */
const SCOPES = [
  "pages_show_list",
  "pages_messaging",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_messages",
].join(",");

export async function GET() {
  // Redirects to /login on its own when there is no session, which is the right
  // answer: the whole point of this route is to act for a known business.
  const ctx = await requireContext();

  const appId = process.env.META_APP_ID;
  if (!appId) {
    return NextResponse.redirect(absoluteUrl(`${DASH.channels}?connect=unconfigured`));
  }

  const url = new URL(`https://www.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", absoluteUrl(CALLBACK_PATH));
  url.searchParams.set("state", issueState(ctx.businessId));
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
