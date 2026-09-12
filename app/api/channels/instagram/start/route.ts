import { NextResponse } from "next/server";
import { requireContext } from "@/lib/session";
import { can } from "@/lib/auth/permissions";
import { issueState } from "@/lib/channels/oauthState";
import { authorizeUrl } from "@/lib/channels/instagramLogin";
import { absoluteUrl } from "@/lib/seo/site";
import { DASH } from "@/lib/dashboard/routes";

export const dynamic = "force-dynamic";

/** Instagram Login, not Facebook Login; its redirect URI is registered under the Instagram product. */
export const CALLBACK_PATH = "/api/channels/instagram/callback";

export async function GET() {
  const ctx = await requireContext();

  if (!can(ctx.role, "channels:write")) {
    return NextResponse.redirect(
      absoluteUrl(`${DASH.channels}?connect=forbidden&channel=INSTAGRAM`),
    );
  }

  // The Instagram app's id, not META_APP_ID.
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
