import { prisma } from "../lib/db";

/**
 * Marks connected channels that hold a credential ACTIVE when an old linkChannel
 * bug left them inactive. Idempotent.
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
    // lastSyncAt is only set when missing.
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
