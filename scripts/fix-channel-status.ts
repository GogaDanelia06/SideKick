import { prisma } from "../lib/db";

/**
 * Repairs channels that hold a working credential but were never marked active.
 *
 * `linkChannel` used to write `connected` and nothing else, so a channel that
 * had just come back from Meta's consent screen read "connected" on the
 * channels page and "off" on the overview card — the two screens ask different
 * columns. It also left `lastSyncAt` blank, so the row claimed it had never
 * synced while it was answering customers.
 *
 * The write is fixed; this is for the rows already in the database. Safe to run
 * more than once: it only touches rows that hold both halves of a credential
 * and are switched on, and only ones that are actually wrong.
 *
 *   npx tsx scripts/fix-channel-status.ts          # show what would change
 *   npx tsx scripts/fix-channel-status.ts --apply  # change it
 */

async function main() {
  const apply = process.argv.includes("--apply");

  const broken = await prisma.channel.findMany({
    where: {
      connected: true,
      externalId: { not: null },
      accessToken: { not: null },
      status: { not: "ACTIVE" },
    },
    select: { id: true, type: true, status: true, businessId: true },
  });

  if (broken.length === 0) {
    console.log("Nothing to repair — every connected channel is already ACTIVE.");
    return;
  }

  for (const c of broken) {
    console.log(`${c.businessId}  ${c.type.padEnd(9)} ${c.status} → ACTIVE`);
  }

  if (!apply) {
    console.log(`\n${broken.length} row(s) would change. Re-run with --apply to write.`);
    return;
  }

  const { count } = await prisma.channel.updateMany({
    where: { id: { in: broken.map((c) => c.id) } },
    // `lastSyncAt` only when it is missing: a real timestamp from an actual
    // delivery is better than "now", and overwriting it would age the row
    // backwards for no reason.
    data: { status: "ACTIVE" },
  });

  await prisma.channel.updateMany({
    where: { id: { in: broken.map((c) => c.id) }, lastSyncAt: null },
    data: { lastSyncAt: new Date() },
  });

  console.log(`\nRepaired ${count} channel(s).`);
}

void main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
