import { PaymentError, type CheckoutRequest, type CheckoutSession, type PaymentAdapter, type ProviderStatus } from "./types";

const API = "https://api.tbcbank.ge/v1/tpay";

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

type PaymentResponse = {
  payId?: string;
  status?: string;
  recId?: string | null;
  links?: { uri?: string; method?: string; rel?: string }[];
  developerMessage?: string | null;
  userMessage?: string | null;
};

async function headers() {
  return {
    "Content-Type": "application/json",
    apikey: process.env.TBC_API_KEY ?? "",
    Authorization: `Bearer ${await accessToken()}`,
  };
}

export const tbc: PaymentAdapter = {
  key: "TBC",

  isConfigured() {
    return Boolean(
      process.env.TBC_API_KEY && process.env.TBC_CLIENT_ID && process.env.TBC_CLIENT_SECRET,
    );
  },

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify({
        amount: { currency: req.currency, total: req.amount },
        returnurl: req.returnUrl,
        callbackUrl: req.callbackUrl,
        merchantPaymentId: req.paymentId,
        // Their docs recommend at most 12; past this the bank expires the
        // payment itself, which is what we want rather than a stuck PENDING row.
        expirationMinutes: 12,
        language: req.locale === "ka" ? "KA" : "EN",
        saveCard: req.saveCard,
        // Statement lines are short; the bank truncates silently otherwise.
        description: req.description.slice(0, 30),
      }),
    });

    if (!res.ok) {
      throw new PaymentError(`TBC payment failed: ${await res.text()}`, "TBC", res.status);
    }

    const data = (await res.json()) as PaymentResponse;
    const redirectUrl = data.links?.find((l) => l.rel === "approval_url")?.uri;
    if (!data.payId || !redirectUrl) {
      throw new PaymentError("TBC response missing payId or approval_url", "TBC");
    }
    return { providerRef: data.payId, redirectUrl };
  },

  async fetchStatus(providerRef: string): Promise<ProviderStatus> {
    const res = await fetch(`${API}/payments/${encodeURIComponent(providerRef)}`, {
      headers: await headers(),
    });

    if (!res.ok) {
      throw new PaymentError(`TBC status failed: ${await res.text()}`, "TBC", res.status);
    }

    const data = (await res.json()) as PaymentResponse;
    switch (data.status) {
      case "Succeeded":
        return { state: "paid", savedCardRef: data.recId ?? null, reason: null };
      case "Created":
      case "Processing":
        return { state: "pending" };
      default:
        return { state: "failed", reason: data.userMessage ?? data.status ?? null };
    }
  },

  /**
   * TBC does not sign its callback, so there is nothing to verify here. That is
   * safe only because the callback is treated as a bare "go and look" ping:
   * the outcome always comes from `fetchStatus` over an authenticated call.
   */
  verifyCallback(): boolean {
    return true;
  },

  refFromCallback(rawBody: string): string | null {
    try {
      const parsed = JSON.parse(rawBody) as { PaymentId?: string; paymentId?: string };
      return parsed.PaymentId ?? parsed.paymentId ?? null;
    } catch {
      // Their callback is documented as a POST "containing PaymentId" and has
      // been seen form-encoded as well, so fall back to parsing it that way.
      const form = new URLSearchParams(rawBody);
      return form.get("PaymentId") ?? form.get("paymentId");
    }
  },
};
