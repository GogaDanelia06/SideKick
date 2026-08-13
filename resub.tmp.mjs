// Is the account still subscribed with the token we hold now? The token was
// replaced after the last check, and a subscription made with an older grant is
// worth re-confirming rather than assumed.
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const ch = await p.channel.findFirst({
  where: { type: "INSTAGRAM", NOT: { accessToken: null } },
  select: { externalId: true, accessToken: true },
});
await p.$disconnect();

const T = encodeURIComponent(ch.accessToken);
const V = "v23.0";
const apply = process.argv.includes("--apply");

const me = await fetch(`https://graph.instagram.com/${V}/me?fields=id,username&access_token=${T}`).then((r) => r.json());
console.log("token account:   ", JSON.stringify(me));
console.log("stored externalId:", ch.externalId);

const before = await fetch(`https://graph.instagram.com/${V}/me/subscribed_apps?access_token=${T}`).then((r) => r.json());
console.log("subscribed_apps: ", JSON.stringify(before));

if (apply) {
  const res = await fetch(`https://graph.instagram.com/${V}/me/subscribed_apps?access_token=${T}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscribed_fields: "messages" }),
  }).then((r) => r.json());
  console.log("\nre-subscribe:    ", JSON.stringify(res));

  const after = await fetch(`https://graph.instagram.com/${V}/me/subscribed_apps?access_token=${T}`).then((r) => r.json());
  console.log("now:             ", JSON.stringify(after));
} else {
  console.log("\n(read-only — pass --apply to re-subscribe)");
}
