import { PaymentError } from "./types";

export const API = "https://api.tbcbank.ge/v1/tpay";

let token: { value: string; expiresAt: number } | undefined;

async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;

  const res = await fetch(`${API}/access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: process.env.TBC_API_KEY ?? "",
    },
    body: new URLSearchParams({
      client_Id: process.env.TBC_CLIENT_ID ?? "",
      client_secret: process.env.TBC_CLIENT_SECRET ?? "",
    }),
  });

  if (!res.ok) {
    throw new PaymentError(`TBC auth failed: ${await res.text()}`, "TBC", res.status);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
  };
  return token.value;
}

export async function headers() {
  return {
    "Content-Type": "application/json",
    apikey: process.env.TBC_API_KEY ?? "",
    Authorization: `Bearer ${await accessToken()}`,
  };
}
