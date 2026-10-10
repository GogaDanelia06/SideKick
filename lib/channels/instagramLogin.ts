const AUTHORIZE = "https://www.instagram.com/oauth/authorize";

export const IG_SCOPES = "instagram_business_basic,instagram_business_manage_messages";

export function authorizeUrl(appId: string, redirectUri: string, state: string): string {
  const url = new URL(AUTHORIZE);
  url.searchParams.set("force_reauth", "true");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", IG_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}
