import { createHmac } from "node:crypto";

export const SECRET = "app-secret-from-meta";

export const sign = (body: string, secret = SECRET) =>
  `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;

export function delivery(messaging: unknown[], pageId = "PAGE_1") {
  return JSON.stringify({
    object: "page",
    entry: [{ id: pageId, time: 1_700_000_000, messaging }],
  });
}

export const message = (over: Record<string, unknown> = {}) => ({
  sender: { id: "PSID_1" },
  recipient: { id: "PAGE_1" },
  timestamp: 1_700_000_000,
  message: { mid: "mid_1", text: "გამარჯობა", ...over },
});
