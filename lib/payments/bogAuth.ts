import { PaymentError } from "./types";

const OAUTH_URL = "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";

let token: { value: string; expiresAt: number } | undefined;

export async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;

  const id = process.env.BOG_CLIENT_ID ?? "";
  const secret = process.env.BOG_CLIENT_SECRET ?? "";
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new PaymentError(`BOG auth failed: ${await res.text()}`, "BOG", res.status);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
  };
  return token.value;
}
