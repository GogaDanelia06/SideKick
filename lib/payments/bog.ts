import { createVerify } from "node:crypto";
import { log } from "@/lib/logger";
import { PaymentError, type CheckoutRequest, type CheckoutSession, type PaymentAdapter, type ProviderStatus } from "./types";

const OAUTH_URL = "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const API = "https://api.bog.ge/payments/v1";

/**
 * Bank of Georgia's published callback key. Their docs say to take the latest
 * from the portal, so it is overridable by env without a deploy — if BOG
 * rotates it, set BOG_PUBLIC_KEY and every callback keeps verifying.
 * https://api.bog.ge/docs/en/payments/standard-process/callback
 */
const DEFAULT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQhzHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrrTYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhxtcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPnPwIDAQAB
-----END PUBLIC KEY-----`;

let token: { value: string; expiresAt: number } | undefined;

/** Cached until a minute before it expires — one round trip per hour, not per payment. */
async function accessToken(): Promise<string> {
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

type OrderResponse = {
  id: string;
  _links?: { redirect?: { href?: string } };
};

type ReceiptResponse = {
  order_status?: { key?: string };
  external_order_id?: string;
  payment_detail?: { card_type?: string; transfer_method?: { key?: string } };
  reject_reason?: string;
};

export const bog: PaymentAdapter = {
  key: "BOG",

  isConfigured() {
    return Boolean(process.env.BOG_CLIENT_ID && process.env.BOG_CLIENT_SECRET);
  },

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const res = await fetch(`${API}/ecommerce/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await accessToken()}`,
        "Accept-Language": req.locale,
        // The bank de-duplicates on this, so a double-submitted checkout
        // creates one order rather than two.
        "Idempotency-Key": req.paymentId,
      },
      body: JSON.stringify({
        callback_url: req.callbackUrl,
        external_order_id: req.paymentId,
        purchase_units: {
          currency: req.currency,
          total_amount: req.amount,
          basket: [
            {
              product_id: req.paymentId,
              quantity: 1,
              unit_price: req.amount,
              description: req.description,
            },
          ],
        },
        redirect_urls: { success: req.returnUrl, fail: req.returnUrl },
      }),
    });

    if (!res.ok) {
      throw new PaymentError(`BOG order failed: ${await res.text()}`, "BOG", res.status);
    }

    const data = (await res.json()) as OrderResponse;
    const redirectUrl = data._links?.redirect?.href;
    if (!data.id || !redirectUrl) {
      throw new PaymentError("BOG order response missing id or redirect link", "BOG");
    }
    return { providerRef: data.id, redirectUrl };
  },

  async fetchStatus(providerRef: string): Promise<ProviderStatus> {
    const res = await fetch(`${API}/receipt/${encodeURIComponent(providerRef)}`, {
      headers: { Authorization: `Bearer ${await accessToken()}` },
    });

    if (!res.ok) {
      throw new PaymentError(`BOG receipt failed: ${await res.text()}`, "BOG", res.status);
    }

    const data = (await res.json()) as ReceiptResponse;
    const key = data.order_status?.key ?? "";

    // Anything not explicitly completed stays pending or fails — we never guess
    // "paid" from an unrecognised status.
    if (key === "completed") return { state: "paid", reason: null };
    if (key === "created" || key === "processing") return { state: "pending" };
    return { state: "failed", reason: data.reject_reason ?? key ?? null };
  },

  verifyCallback(rawBody: string, headers: Headers): boolean {
    const signature = headers.get("Callback-Signature");
    if (!signature) return false;

    try {
      const key = process.env.BOG_PUBLIC_KEY?.trim() || DEFAULT_PUBLIC_KEY;
      return createVerify("SHA256")
        .update(rawBody)
        .verify(key, Buffer.from(signature, "base64"));
    } catch (err) {
      log.error("BOG callback signature check threw", err);
      return false;
    }
  },

  refFromCallback(rawBody: string): string | null {
    try {
      const parsed = JSON.parse(rawBody) as { body?: { order_id?: string } };
      return parsed.body?.order_id ?? null;
    } catch {
      return null;
    }
  },
};
