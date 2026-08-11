import { PrismaClient } from "@prisma/client";
import { nameCustomer } from "@/lib/channels/profile";

const prisma = new PrismaClient();

/** Meta throttles per app. A gap between calls keeps a backlog from tripping it. */
const GAP_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const pending = await prisma.conversation.findMany({
    where: {
      customerName: null,
      customerRef: { not: null },
      // Only the two surfaces with a profile API behind them. A website chat
      // has no Meta id to look up.
      channel: { type: { in: ["FACEBOOK", "INSTAGRAM"] }, accessToken: { not: null } },
    },
    select: {
      id: true,
      customerRef: true,
      createdAt: true,
      channel: { select: { type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (pending.length === 0) {
    console.log("nothing to do — every chat with a Meta id already has a name.");
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
