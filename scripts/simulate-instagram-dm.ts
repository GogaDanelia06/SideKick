import { createHmac } from "node:crypto";

/**
 * Sends the webhook Meta *would* send, signed exactly as Meta signs it.
 *
 * Instagram will not deliver a real DM to an unpublished app — Meta says so in
 * the Configure webhooks panel — so the last mile of this integration cannot be
 * exercised by messaging the account. Everything after that mile can: the
 * signature check, the parser, the tenant lookup, the inbox, the AI reply. This
 * plays the part of Meta so that the rest is provably working before anyone
 * waits on business verification.
 *
 * It is not a test double. The request is real, the signature is real, and the
 * message lands in the real inbox — which is the point, and also the reason to
 * delete the conversation afterwards.
 *
 *   INSTAGRAM_APP_SECRET=… IG_ACCOUNT_ID=… npx tsx scripts/simulate-instagram-dm.ts "text"
 */

const secret = process.env.INSTAGRAM_APP_SECRET;
const accountId = process.env.IG_ACCOUNT_ID;
const url = process.env.WEBHOOK_URL ?? "https://sidekick.ge/api/webhooks/messenger";
const text = process.argv[2] ?? "გამარჯობა, ეს სატესტო შეტყობინებაა";

// The sender is invented, and deliberately stable across runs: a fixed id keeps
// every simulated message in one conversation instead of littering the inbox
// with a new customer each time.
const senderId = process.env.IG_SENDER_ID ?? "9900000000000001";

if (!secret || !accountId) {
  console.error(
    "Set INSTAGRAM_APP_SECRET and IG_ACCOUNT_ID.\n" +
      "  INSTAGRAM_APP_SECRET — Meta App Dashboard → Instagram → API setup with Instagram login\n" +
      "  IG_ACCOUNT_ID        — the account id stored on the channel (the 17841… one)",
  );
  process.exit(1);
}

// The Instagram Login shape: `changes[]` with a `messages` field, not the
// `messaging[]` array the Messenger Platform sends. Both are accepted by the
// webhook, and sending the wrong one here would test the wrong branch.
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
            // Unique per run, because a repeated mid is recognised as a retry
            // and stored once — correct behaviour, and not what we want to see.
            message: { mid: `sim_${Date.now()}`, text },
          },
        },
      ],
    },
  ],
});

const signature = `sha256=${createHmac("sha256", secret).update(payload, "utf8").digest("hex")}`;

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
