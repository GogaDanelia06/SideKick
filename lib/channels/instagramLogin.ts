/**
 * The authorise step of **Instagram Login** — a different product from Facebook
 * Login, not a variant of it.
 *
 * The distinction is the one this codebase got wrong for a long time and it is
 * worth stating once, here, plainly. Facebook Login authorises a *Page* and
 * hands back a Page Access Token (`EAA…`) that works against
 * graph.facebook.com. Instagram Login authorises an *Instagram professional
 * account* directly and hands back an `IGA…` token that works against
 * graph.instagram.com. Different authorise host, different app id, different
 * app secret, different scope names, different token.
 *
 * Asking for `instagram_manage_messages` on Facebook's dialog — which is what
 * we used to do — is not a smaller version of this. Those scopes do not exist
 * there, so the account never grants message access, and Meta then delivers no
 * webhooks at all. Not an error, not a rejected delivery: silence.
 *
 * The token exchange that follows this step lives in instagramToken.ts.
 */

/** Instagram's own authorise screen. Not facebook.com — that is the other product. */
const AUTHORIZE = "https://www.instagram.com/oauth/authorize";

/**
 * What we ask the merchant to grant, and nothing else:
 *
 * - `instagram_business_basic`           — to read which account we just connected
 * - `instagram_business_manage_messages` — to receive DMs and reply to them
 *
 * The second one is load-bearing in a way that is easy to miss: without it Meta
 * accepts the webhook subscription and then never sends anything to it.
 */
export const IG_SCOPES = "instagram_business_basic,instagram_business_manage_messages";

/** Where the merchant is sent to grant access. */
export function authorizeUrl(appId: string, redirectUri: string, state: string): string {
  const url = new URL(AUTHORIZE);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", IG_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}
