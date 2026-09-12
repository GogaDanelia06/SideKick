import { createHmac } from "node:crypto";

/**
 * Sends a correctly signed Instagram webhook, since Meta does not deliver real DMs to
 * an unpublished app. The message lands in the real inbox; delete it afterwards.
 *
 *   INSTAGRAM_APP_SECRET=… IG_ACCOUNT_ID=… npx tsx scripts/simulate-instagram-dm.ts "text"
 */

const secret = process.env.INSTAGRAM_APP_SECRET;
const accountId = process.env.IG_ACCOUNT_ID;
const url = process.env.WEBHOOK_URL ?? "https://sidekick.ge/api/webhooks/messenger";
const text = process.argv[2] ?? "გამარჯობა, ეს სატესტო შეტყობინებაა";

// A stable fake sender keeps every run in one conversation.
const senderId = process.env.IG_SENDER_ID ?? "9900000000000001";

if (!secret || !accountId) {
  console.error(
    "Set INSTAGRAM_APP_SECRET and IG_ACCOUNT_ID.\n" +
      "  INSTAGRAM_APP_SECRET — Meta App Dashboard → Instagram → API setup with Instagram login\n" +
      "  IG_ACCOUNT_ID        — the account id stored on the channel (the 17841… one)",
  );
  process.exit(1);
}

// Instagram Login's `changes[]` shape.
const payload = JSON.stringify({
  object: "instagram",
  entry: [
    {
      id: accountId,
      time: Math.floor(Date.now() / 1000),
      changes: [
        {
          field: "messages",
          value: {
            sender: { id: senderId },
            recipient: { id: accountId },
            timestamp: String(Date.now()),
            // A unique mid per run; a repeated one is treated as a retry.
            message: { mid: `sim_${Date.now()}`, text },
          },
        },
      ],
    },
  ],
});

const signature = `sha256=${createHmac("sha256", secret).update(payload, "utf8").digest("hex")}`;

// tsx compiles to CommonJS, where top-level await is not allowed.
async function main() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": signature,
      "user-agent": "Webhooks/1.0 (simulated)",
    },
    body: payload,
  });

  console.log(`${res.status} ${res.statusText} — ${await res.text()}`);
  console.log(
    res.status === 200
      ? "\nDelivered. Open the inbox: a chat from a customer whose id ends 0001.\n" +
          "A 200 alone does not mean it was stored — check the logs for either\n" +
          "'inbound message dropped' (the account id does not match a channel)\n" +
          "or nothing at all, which is the quiet sound of success."
      : "\nRejected. 403 means the signature did not match, so INSTAGRAM_APP_SECRET\nhere is not the one the deployed app is checking against.",
  );
}

void main();
