import { PaymentError, type CheckoutRequest, type CheckoutSession, type PaymentAdapter, type ProviderStatus } from "./types";
import { API, headers } from "./tbcAuth";

type PaymentResponse = {
  payId?: string;
  status?: string;
  recId?: string | null;
  links?: { uri?: string; method?: string; rel?: string }[];
  developerMessage?: string | null;
  userMessage?: string | null;
};

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
        expirationMinutes: 12,
        language: req.locale === "ka" ? "KA" : "EN",
        saveCard: req.saveCard,
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

  verifyCallback(): boolean {
    return true;
  },

  refFromCallback(rawBody: string): string | null {
    try {
      const parsed = JSON.parse(rawBody) as { PaymentId?: string; paymentId?: string };
      return parsed.PaymentId ?? parsed.paymentId ?? null;
    } catch {
      const form = new URLSearchParams(rawBody);
      return form.get("PaymentId") ?? form.get("paymentId");
    }
  },
};
