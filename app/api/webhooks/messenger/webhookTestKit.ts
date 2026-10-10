import { createHmac } from "node:crypto";
import { afterEach, beforeEach } from "vitest";
import type { recordInbound } from "@/lib/channels/inbound";

export const APP_SECRET = "meta-app-secret";
export const VERIFY_TOKEN = "our-verify-token-1234";

type Stored = NonNullable<Awaited<ReturnType<typeof recordInbound>>>;

type Sent = { from: string; mid: string; text: string; echo?: boolean };

export const sign = (body: string, secret = APP_SECRET) =>
  `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;

export const delivery = (object: "page" | "instagram", id: string, sent: Sent[]) =>
  JSON.stringify({
    object,
    entry: [
      {
        id,
        messaging: sent.map(({ from, mid, text, echo }) => ({
          sender: { id: from },
          message: { mid, text, ...(echo ? { is_echo: true } : {}) },
        })),
      },
    ],
  });

export const body = (text = "გამარჯობა", mid = "mid_1") =>
  delivery("page", "PAGE_1", [{ from: "PSID_1", mid, text }]);

export const stored = (over: Partial<Stored> = {}): Stored => ({
  businessId: "b1",
  channel: "FACEBOOK",
  conversationId: "conv1",
  messageId: "m1",
  isNew: true,
  needsName: false,
  text: "გამარჯობა",
  ...over,
});

export function post(raw: string, signature: string | null) {
  return new Request("https://sidekick.ge/api/webhooks/messenger", {
    method: "POST",
    body: raw,
    headers: signature ? { "x-hub-signature-256": signature } : {},
  });
}

export const get = (params: string) => new Request(`https://sidekick.ge/api/webhooks/messenger?${params}`);

export function setupMetaEnv() {
  beforeEach(() => {
    process.env.META_APP_SECRET = APP_SECRET;
    process.env.META_VERIFY_TOKEN = VERIFY_TOKEN;
  });

  afterEach(() => {
    delete process.env.META_APP_SECRET;
    delete process.env.META_VERIFY_TOKEN;
  });
}
