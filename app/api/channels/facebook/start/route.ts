import { NextResponse } from "next/server";
import { requireContext } from "@/lib/session";
import { can } from "@/lib/auth/permissions";
import { issueState } from "@/lib/channels/oauthState";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";

export const dynamic = "force-dynamic";

/** Kept outside /api/auth, where the NextAuth catch-all would swallow it. */
export const CALLBACK_PATH = "/api/channels/facebook/callback";

/**
 * Page access plus Instagram messaging: Instagram messages routed through the Page
 * (Messenger Platform) are delivered even while the app is unpublished.
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
  const ctx = await requireContext();

  if (!can(ctx.role, "channels:write")) {
    return NextResponse.redirect(
      absoluteUrl(`${DASH.channels}?connect=forbidden&channel=FACEBOOK`),
    );
  }

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
