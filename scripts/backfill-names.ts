import { PrismaClient } from "@prisma/client";
import { nameCustomer } from "@/lib/channels/profile";

const prisma = new PrismaClient();

/** Meta throttles per app. A gap between calls keeps a backlog from tripping it. */
const GAP_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Deliberately unfiltered beyond "has no name". Narrowing to channels that
  // hold a token would hide the most likely reason a chat is nameless behind a
  // cheerful "nothing to do", and send whoever ran this looking at Meta instead
  // of at the row in front of them.
  const nameless = await prisma.conversation.findMany({
    where: { customerName: null, customerRef: { not: null } },
    select: {
      id: true,
      customerRef: true,
      createdAt: true,
      channel: { select: { type: true, accessToken: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (nameless.length === 0) {
    console.log("nothing to do — every chat with a customer id already has a name.");
    return;
  }

  // Only the two surfaces with a profile API behind them, and only where we
  // hold the token that opens it. A website chat has no Meta id to look up.
  const isMeta = (t?: string) => t === "FACEBOOK" || t === "INSTAGRAM";
  const pending = nameless.filter((c) => isMeta(c.channel?.type) && c.channel?.accessToken);
  const blocked = nameless.filter((c) => !pending.includes(c));

  if (blocked.length > 0) {
    console.log(`${blocked.length} chat(s) cannot be looked up:\n`);
    for (const c of blocked) {
      const why = !isMeta(c.channel?.type)
        ? `channel is ${c.channel?.type ?? "not set"} — no profile API`
        : "channel has no accessToken — nothing to authenticate the lookup with";
      console.log(`  ${c.customerRef}  ${why}`);
    }
    console.log(
      "\nA missing accessToken is the usual one, and it is a setup gap rather\n" +
        "than a Meta problem: the Page Access Token has to be stored on the\n" +
        "channel row. Replies cannot go out without it either.\n",
    );
  }

  if (pending.length === 0) {
    console.log("no chat is in a state where Meta could be asked.");
    return;
  }

  console.log(`${pending.length} chat(s) without a name:\n`);
  for (const c of pending) {
    console.log(`  ${c.channel?.type.padEnd(9)} ${c.customerRef}  (${c.createdAt.toISOString().slice(0, 10)})`);
  }

  if (dryRun) {
    console.log("\n--dry-run: nothing was changed.");
    return;
  }

  console.log("\nasking Meta…\n");
  let named = 0;

  for (const c of pending) {
    await nameCustomer(c.id);

    // Read it back rather than trusting the call: `nameCustomer` stays quiet on
    // a profile Meta declines, which is the case worth counting separately.
    const after = await prisma.conversation.findUnique({
      where: { id: c.id },
      select: { customerName: true },
    });

    if (after?.customerName) {
      named += 1;
      console.log(`  ✓ ${c.customerRef} → ${after.customerName}`);
    } else {
      console.log(`  · ${c.customerRef} — no name returned`);
    }

    await sleep(GAP_MS);
  }

  console.log(`\nnamed ${named} of ${pending.length}.`);

  if (named < pending.length) {
    // The usual cause, and not a fault in this script: before App Review the
    // profile API only answers for people who hold a role in the Meta app.
    console.log(
      "\nThe ones with no name are normal in Development Mode — Meta only\n" +
        "discloses profiles of people with a role in the app. They will fill in\n" +
        "on their own once the app is approved and those customers write again.",
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
